"use client";



export const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SummaryApi = {
  user: {
    craete:{
      method:"POST",
      url:`${baseURL}/api/users/create`
    },
    register: {
      method: "POST",
      url: `${baseURL}/api/users/register`,
    },

    login: {
      method: "POST",
      url: `${baseURL}/api/users/login`,
    },
    logout: {
      method: "POST",
      url: `${baseURL}/api/users/logout`,
    },
  

    refreshToken: {
      method: "POST",
      url: `${baseURL}/api/users/refresh-token`,
    },
    authme:{
      method:"get",
      url: `${baseURL}/api/users/auth/me`
    },

    // get user by ID
    getUserById: (id: number | string) => ({
      method: "GET",
      url: `${baseURL}/api/users/getUser/${id}`,
    }),

    // update user
    updateUser: (id: number | string) => ({
      method: "PATCH",
      url: `${baseURL}/api/users/update/${id}`,
    }),
    updateProfile:(id:number |string)=>({
      method:"PATCH",
      url:`${baseURL}/api/users/updateprofile/${id}`
    }),

    // delete user (ADMIN only)
    deleteUser: (id: number | string) => ({
      method: "DELETE",
      url: `${baseURL}/api/users/delete/${id}`,
    }),
    get_all_users:{
      method:"GET",
      url:`${baseURL}/api/users/get-all`
    },
    get_active:{
      method:"GET",
      url:`${baseURL}/api/users/active`
    }
  },
  owner:{
     create_bus: {
      method: "POST",
      url: `${baseURL}/api/bus/createbusinesses`,
    },
     get_bus: {
      method: "GET",
      url: `${baseURL}/api/bus/getbusinesses`,
    },
   get_bus_by_user: {
    method: "GET",
    url: `${baseURL}/api/bus/getbusinesse`  
    },

      updateBus: (id: number | string) => ({
      method: "PUT",
      url: `${baseURL}/api/bus/updatebusinesses/${id}` 
    }),
     deleteBus: (id: number | string) => ({
      method: "DELETE",
      url: `${baseURL}/api/bus/deletebusinesses/${id}`   
    }),
     getbusinessesState: (id: number | string) => ({
      method: "GET",
      url: `${baseURL}/api/bus/getbusinessesState/${id}/stats`,
    }),
     create_event: {
      method: "POST",
      url: `${baseURL}/api/events/create-events`,
    },
     get_bus_event: (id: number | string) => ({
      method: "GET",
      url: `${baseURL}/api/events/get-businesses/${id}/events`,
    }),
    check_user_business:{
      method: "GET",
      url: `${baseURL}/api/bus/checkUserBusiness`,
    }

  },
  category:{
     create_category: {
      method: "POST",
      url: `${baseURL}/api/categories/createcategory`,
    },
      get_categories: {
      method: "GET",
      url: `${baseURL}/api/categories/getcategories`,
    },
      get_category: (id: number | string) => ({
      method: "GET",
      url: `${baseURL}/api/categories/getcategory/${id}`,
      }),
     updateCategory: (id: number | string) => ({
      method: "PUT",
     url: `${baseURL}/api/categories/updatecategory/${id}`
    }),
     deleteCategory: (id: number | string) => ({
      method: "DELETE",
      url: `${baseURL}/api/categories/deleteCategory/${id}`,
    }),
  },
  ad:{
     get_public_ads: {
        method: "GET",
        url: `${baseURL}/api/ads/get-public`,
  },

  get_ads_by_type: (type: string) => ({
    method: "GET",
    url: `${baseURL}/api/ads/get-adstype/${type}`,
    params:{
      _t:Date.now()
    }
  }),

  increment_clicks: (id: number | string) => ({
    method: "POST",
    url: `${baseURL}/api/ads/incremant/${id}/click`,
  }),

  // ============ AUTHENTICATED ADS ============
  create_ad: {
    method: "POST",
    url: `${baseURL}/api/ads/create-add`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  },

  get_all_ads: {
    method: "GET",
    url: `${baseURL}/api/ads/get-all`,
  },

  get_my_ads: {
    method: "GET",
    url: `${baseURL}/api/ads/get-my`,
  },

  get_ad_by_id: (id: number | string) => ({
    method: "GET",
    url: `${baseURL}/api/ads/get-add/${id}`,
  }),

  update_ad_status: (id: number | string) => ({
    method: "PUT",
    url: `${baseURL}/api/ads/update-states/${id}/status`,
  }),

  update_ad: (id: number | string) => ({
    method: "PUT",
    url: `${baseURL}/api/ads/update-ad/${id}`,
  }),

  delete_ad: (id: number | string) => ({
    method: "DELETE",
    url: `${baseURL}/api/ads/delete-add/${id}`,
  }),
  },
  blood_req : {
  // ===== PUBLIC =====
  getAllBloodRequests: {
    method: "GET",
    url: `${baseURL}/api/bloodreq/blood-requests`,
  },

  searchBloodRequests: {
    method: "GET",
    url: `${baseURL}/api/bloodreq/blood-requests/search`,
  },

  bloodRequestsStatistics: {
    method: "GET",
    url: `${baseURL}/api/bloodreq/blood-requests/statistics`,
  },

  getBloodRequestById: (id: number | string) => ({
    method: "GET",
    url: `${baseURL}/api/bloodreq/blood-requests/${id}`,
  }),

  matchDonors: (id: number | string) => ({
    method: "GET",
    url: `${baseURL}/api/bloodreq/blood-requests/${id}/match-donors`,
  }),

  // ===== AUTHENTICATED =====
  createBloodRequest: {
    method: "POST",
    url: `${baseURL}/api/bloodreq/blood-requests`,
  },

  getMyBloodRequests: {
    method: "GET",
    url: `${baseURL}/api/bloodreq/my/blood-requests`,
  },

  // ===== OWNER =====
  updateBloodRequest: (id: number | string) => ({
    method: "PUT",
    url: `${baseURL}/api/bloodreq/blood-requests/${id}`,
  }),

  deleteBloodRequest: (id: number | string) => ({
    method: "DELETE",
    url: `${baseURL}/api/bloodreq/blood-requests/${id}`,
  }),

  // ===== ADMIN =====
  updateBloodRequestStatus: (id: number | string) => ({
    method: "PUT",
    url: `${baseURL}/api/bloodreq/blood-requests/${id}/status`,
  })
},
 bloodDonors :{
  // ===== PUBLIC =====
  searchDonors: {
    method: "GET",
    url: `${baseURL}/api/blooddon/blood-donors/search`,
  },

  donorStatistics: {
    method: "GET",
    url: `${baseURL}/api/blooddon/blood-donors/statistics`,
  },

  // ===== AUTHENTICATED =====
  registerDonor: {
    method: "POST",
    url: `${baseURL}/api/blooddon/blood-donors/register`,
  },

  getMyDonorProfile: {
    method: "GET",
    url: `${baseURL}/api/blooddon/blood-donors/my-profile`,
  },

  updateDonorStatus: {
    method: "PUT",
    url: `${baseURL}/api/blooddon/blood-donors/status`,
  },
   updateDonorProfile: {
    url: "/api/blooddon/blood-donors/update-profile",
    method: "PUT"
  },

  updateLastDonation: {
    method: "PUT",
    url: `${baseURL}/api/blooddon/blood-donors/last-donation`,
  },

  // ===== ADMIN =====
  getAllDonors: {
    method: "GET",
    url: `${baseURL}/api/blooddon/blood-donors`,
  },
},
job: {
  // ===== مسارات عامة (بدون تسجيل) =====
  getFeaturedJobs: {
    method: "GET",
    url: `${baseURL}/api/jobs/featured`,
  },
  quickSearchJobs: {
    method: "GET",
    url: `${baseURL}/api/jobs/search/quick`,
  },
  getJobsByCategory: (type: string) => ({
    method: "GET",
    url: `${baseURL}/api/jobs/category/${type}`,
  }),
  getPopularCategories: {
    method: "GET",
    url: `${baseURL}/api/jobs/popular-categories`,
  },
  getJobById: (id: number | string) => ({
    method: "GET",
    url: `${baseURL}/api/jobs/getjob/${id}`,
  }),
  getJobsInMyCity: {
    method: "GET",
    url: `${baseURL}/api/jobs/mycity`,
  },
  getNewJobsNotification: {
    method: "GET",
    url: `${baseURL}/api/jobs/notifications/new`,
  },

  // ===== ADMIN فقط =====
  getAllJobs: {  // ✅ ADMIN فقط - مع authentication
    method: "GET",
    url: `${baseURL}/api/jobs/getall`,
  },
  getJobsStatistics: {  // ✅ ADMIN فقط
    method: "GET",
    url: `${baseURL}/api/jobs/statistics`,
  },

  // ===== OWNER فقط =====
  createJob: {
    method: "POST",
    url: `${baseURL}/api/jobs/create`, 
  },
  getBusinessJobs: {
    method: "GET",
    url: `${baseURL}/api/jobs/business/myjobs`,
  },

  // ===== ADMIN + OWNER =====
  updateJob: (id: number | string) => ({
    method: "PUT",
    url: `${baseURL}/api/jobs/update/${id}`,
  }),
  deleteJob: (id: number | string) => ({
    method: "DELETE",
    url: `${baseURL}/api/jobs/delete/${id}`,
  }),
  renewJob: (id: number | string) => ({
    method: "PATCH",
    url: `${baseURL}/api/jobs/${id}/renew`,
  }),
  toggleJobStatus: (id: number | string) => ({
    method: "PATCH",
    url: `${baseURL}/api/jobs/${id}/toggle-status`,
  }),
},

};

export default SummaryApi;
