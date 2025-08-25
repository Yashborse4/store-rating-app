const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');

/**
 * Get dashboard statistics based on user role
 * Different stats are returned based on user role:
 * - system_admin: Full system statistics
 * - store_owner: Store-specific statistics
 * - normal_user: User's rating statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    switch (userRole) {
      case 'system_admin':
        stats = await getAdminDashboardStats();
        break;
      
      case 'store_owner':
        stats = await getStoreOwnerDashboardStats(userId);
        break;
      
      case 'normal_user':
      default:
        stats = await getUserDashboardStats(userId);
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        role: userRole,
        stats
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get admin dashboard statistics
 */
const getAdminDashboardStats = async () => {
  try {
    // Get all stores with statistics
    const stores = await Store.findAll();
    const users = await User.findAll();
    const ratings = await Rating.findAll();

    // Calculate store statistics
    const activeStores = stores.filter(store => store.is_active !== false);
    const totalRatings = ratings.length;
    
    // Calculate average rating across all stores
    let averageRating = 0;
    if (stores.length > 0) {
      const storesWithRatings = stores.filter(store => store.average_rating > 0);
      if (storesWithRatings.length > 0) {
        const totalRatingSum = storesWithRatings.reduce((sum, store) => 
          sum + parseFloat(store.average_rating || 0), 0);
        averageRating = (totalRatingSum / storesWithRatings.length).toFixed(1);
      }
    }

    // User statistics
    const activeUsers = users.filter(user => user.is_active !== false);
    const usersByRole = {
      system_admin: users.filter(u => u.role_id === 1).length,
      normal_user: users.filter(u => u.role_id === 2).length,
      store_owner: users.filter(u => u.role_id === 3).length
    };

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRatings = ratings.filter(rating => {
      const ratingDate = new Date(rating.created_at);
      return ratingDate >= sevenDaysAgo;
    });

    // Top rated stores
    const topRatedStores = stores
      .filter(store => store.average_rating > 0)
      .sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating))
      .slice(0, 5)
      .map(store => ({
        id: store.id,
        name: store.store_name,
        rating: parseFloat(store.average_rating || 0),
        totalRatings: ratings.filter(r => r.store_id === store.id).length
      }));

    return {
      overview: {
        totalStores: stores.length,
        activeStores: activeStores.length,
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        totalRatings: totalRatings,
        averageRating: parseFloat(averageRating)
      },
      userBreakdown: usersByRole,
      recentActivity: {
        ratingsLast7Days: recentRatings.length,
        averageRatingsPerDay: (recentRatings.length / 7).toFixed(1)
      },
      topRatedStores,
      storeCategories: getStoreCategoryStats(stores),
      ratingDistribution: getRatingDistribution(ratings)
    };

  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    throw error;
  }
};

/**
 * Get store owner dashboard statistics
 */
const getStoreOwnerDashboardStats = async (ownerId) => {
  try {
    // Get the store owned by this user
    const store = await Store.findByOwnerUserId(ownerId);
    
    if (!store) {
      return {
        hasStore: false,
        message: 'No store associated with this account'
      };
    }

    // Get all ratings for this store
    const storeRatings = await Rating.findByStoreId(store.id);
    const ratingStats = await Rating.getStoreRatingStats(store.id);

    // Calculate rating distribution
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    storeRatings.forEach(rating => {
      if (rating.rating >= 1 && rating.rating <= 5) {
        ratingCounts[rating.rating]++;
      }
    });

    // Recent ratings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRatings = storeRatings.filter(rating => {
      const ratingDate = new Date(rating.created_at);
      return ratingDate >= thirtyDaysAgo;
    });

    // Daily rating trend for last 7 days
    const dailyTrend = getDailyRatingTrend(storeRatings, 7);

    // Top reviewers
    const reviewerStats = {};
    storeRatings.forEach(rating => {
      if (rating.user_name) {
        if (!reviewerStats[rating.user_name]) {
          reviewerStats[rating.user_name] = {
            name: rating.user_name,
            count: 0,
            totalRating: 0
          };
        }
        reviewerStats[rating.user_name].count++;
        reviewerStats[rating.user_name].totalRating += rating.rating;
      }
    });

    const topReviewers = Object.values(reviewerStats)
      .map(reviewer => ({
        name: reviewer.name,
        reviewCount: reviewer.count,
        averageRating: (reviewer.totalRating / reviewer.count).toFixed(1)
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);

    return {
      hasStore: true,
      store: {
        id: store.id,
        name: store.store_name,
        description: store.store_description,
        isActive: store.is_active !== false,
        createdAt: store.created_at
      },
      overview: {
        totalRatings: storeRatings.length,
        averageRating: parseFloat(store.average_rating || 0),
        ratingsLast30Days: recentRatings.length,
        percentageChange: calculatePercentageChange(storeRatings)
      },
      ratingDistribution: ratingCounts,
      ratingStats: {
        ...ratingStats,
        satisfactionRate: calculateSatisfactionRate(ratingCounts)
      },
      recentRatings: recentRatings.slice(0, 10).map(rating => ({
        id: rating.id,
        rating: rating.rating,
        userName: rating.user_name || 'Anonymous',
        createdAt: rating.created_at
      })),
      dailyTrend,
      topReviewers
    };

  } catch (error) {
    console.error('Error getting store owner dashboard stats:', error);
    throw error;
  }
};

/**
 * Get normal user dashboard statistics
 */
const getUserDashboardStats = async (userId) => {
  try {
    // Get all stores with user's ratings
    const stores = await Store.findAllWithUserRating(userId);
    const userRatings = await Rating.findByUserId(userId);

    // Calculate statistics
    const ratedStores = stores.filter(store => store.user_rating !== null);
    const unratedStores = stores.filter(store => store.user_rating === null);

    // Average rating given by user
    let userAverageRating = 0;
    if (userRatings.length > 0) {
      const totalRating = userRatings.reduce((sum, rating) => sum + rating.rating, 0);
      userAverageRating = (totalRating / userRatings.length).toFixed(1);
    }

    // Recent ratings by user
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUserRatings = userRatings.filter(rating => {
      const ratingDate = new Date(rating.created_at);
      return ratingDate >= sevenDaysAgo;
    });

    // Top rated stores overall
    const topRatedStores = stores
      .filter(store => parseFloat(store.average_rating || 0) > 0)
      .sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating))
      .slice(0, 5)
      .map(store => ({
        id: store.id,
        name: store.store_name,
        averageRating: parseFloat(store.average_rating || 0),
        userRating: store.user_rating,
        description: store.store_description
      }));

    // Stores user hasn't rated yet (recommendations)
    const recommendations = unratedStores
      .filter(store => parseFloat(store.average_rating || 0) >= 4.0)
      .sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating))
      .slice(0, 5)
      .map(store => ({
        id: store.id,
        name: store.store_name,
        averageRating: parseFloat(store.average_rating || 0),
        description: store.store_description
      }));

    return {
      overview: {
        totalStores: stores.length,
        ratedStores: ratedStores.length,
        unratedStores: unratedStores.length,
        totalRatingsGiven: userRatings.length,
        averageRatingGiven: parseFloat(userAverageRating),
        recentRatings: recentUserRatings.length
      },
      ratingActivity: {
        last7Days: recentUserRatings.length,
        thisMonth: getMonthlyRatingCount(userRatings),
        allTime: userRatings.length
      },
      topRatedStores,
      recommendations,
      recentlyRated: userRatings.slice(0, 5).map(rating => ({
        storeId: rating.store_id,
        storeName: stores.find(s => s.id === rating.store_id)?.store_name || 'Unknown',
        rating: rating.rating,
        createdAt: rating.created_at
      })),
      ratingDistribution: getUserRatingDistribution(userRatings)
    };

  } catch (error) {
    console.error('Error getting user dashboard stats:', error);
    throw error;
  }
};

// Helper functions
const getStoreCategoryStats = (stores) => {
  const categories = {};
  stores.forEach(store => {
    const category = store.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category]++;
  });
  return categories;
};

const getRatingDistribution = (ratings) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach(rating => {
    if (rating.rating >= 1 && rating.rating <= 5) {
      distribution[rating.rating]++;
    }
  });
  return distribution;
};

const getUserRatingDistribution = (ratings) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach(rating => {
    if (rating.rating >= 1 && rating.rating <= 5) {
      distribution[rating.rating]++;
    }
  });
  return distribution;
};

const getDailyRatingTrend = (ratings, days) => {
  const trend = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayRatings = ratings.filter(rating => {
      const ratingDate = new Date(rating.created_at);
      return ratingDate >= date && ratingDate < nextDate;
    });
    
    trend.push({
      date: date.toISOString().split('T')[0],
      count: dayRatings.length,
      averageRating: dayRatings.length > 0 
        ? (dayRatings.reduce((sum, r) => sum + r.rating, 0) / dayRatings.length).toFixed(1)
        : 0
    });
  }
  
  return trend;
};

const calculatePercentageChange = (ratings) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const lastMonth = ratings.filter(rating => {
    const date = new Date(rating.created_at);
    return date >= thirtyDaysAgo;
  }).length;
  
  const previousMonth = ratings.filter(rating => {
    const date = new Date(rating.created_at);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;
  
  if (previousMonth === 0) return lastMonth > 0 ? 100 : 0;
  return ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1);
};

const calculateSatisfactionRate = (ratingCounts) => {
  const total = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  const satisfied = (ratingCounts[4] || 0) + (ratingCounts[5] || 0);
  return ((satisfied / total) * 100).toFixed(1);
};

const getMonthlyRatingCount = (ratings) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return ratings.filter(rating => {
    const date = new Date(rating.created_at);
    return date >= thirtyDaysAgo;
  }).length;
};

module.exports = {
  getDashboardStats
};
