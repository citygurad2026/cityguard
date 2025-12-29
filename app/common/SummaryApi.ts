"use client";

const SummaryApi = {
  user: {
    create: {
      method: "POST",
      url: "/api/users/create",
    },
    register: {
      method: "POST",
      url: "/api/users/register",
    },
    login: {
      method: "POST",
      url: "/api/users/login",
    },
    refreshToken: {
      method: "POST",
      url: "/api/users/refresh-token",
    },
    getUserById: (id: number | string) => ({
      method: "GET",
      url: `/api/users/getUser/${id}`,
    }),
    updateUser: (id: number | string) => ({
      method: "PATCH",
      url: `/api/users/update/${id}`,
    }),
    deleteUser: (id: number | string) => ({
      method: "DELETE",
      url: `/api/users/delete/${id}`,
    }),
    get_all_users: {
      method: "GET",
      url: "/api/users/get-all",
    },
    get_active: {
      method: "GET",
      url: "/api/users/active",
    },
  },

  owner: {
    create_bus: {
      method: "POST",
      url: "/api/bus/createbusinesses",
    },
    get_bus: {
      method: "GET",
      url: "/api/bus/getbusinesses",
    },
    get_bus_by_id: (id: number | string) => ({
      method: "GET",
      url: `/api/bus/getbusinesse/${id}`,
    }),
    updateBus: (id: number | string) => ({
      method: "PUT",
      url: `/api/bus/updatebusinesses/${id}`,
    }),
    deleteBus: (id: number | string) => ({
      method: "DELETE",
      url: `/api/bus/deletebusinesses/${id}`,
    }),
    getbusinessesState: (id: number | string) => ({
      method: "GET",
      url: `/api/bus/getbusinessesState/${id}/stats`,
    }),
    create_event: {
      method: "POST",
      url: "/api/events/create-events",
    },
    get_bus_event: (id: number | string) => ({
      method: "GET",
      url: `/api/events/get-businesses/${id}/events`,
    }),
    check_user_business: {
      method: "GET",
      url: "/api/bus/checkUserBusiness",
    },
  },

  category: {
    create_category: {
      method: "POST",
      url: "/api/categories/createcategory",
    },
    get_categories: {
      method: "GET",
      url: "/api/categories/getcategories",
    },
    get_category: (id: number | string) => ({
      method: "GET",
      url: `/api/categories/getcategory/${id}`,
    }),
    updateCategory: (id: number | string) => ({
      method: "PUT",
      url: `/api/categories/updatecategory/${id}`,
    }),
    deleteCategory: (id: number | string) => ({
      method: "DELETE",
      url: `/api/categories/deleteCategory/${id}`,
    }),
  },

  ad: {
    get_public_ads: {
      method: "GET",
      url: "/api/ads/get-public",
    },
    get_ads_by_type: (type: string) => ({
      method: "GET",
      url: `/api/ads/get-adstype/${type}`,
    }),
    increment_clicks: (id: number | string) => ({
      method: "POST",
      url: `/api/ads/incremant/${id}/click`,
    }),
    create_ad: {
      method: "POST",
      url: "/api/ads/create-add",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    get_all_ads: {
      method: "GET",
      url: "/api/ads/get-all",
    },
    get_my_ads: {
      method: "GET",
      url: "/api/ads/get-my",
    },
    get_ad_by_id: (id: number | string) => ({
      method: "GET",
      url: `/api/ads/get-add/${id}`,
    }),
    update_ad_status: (id: number | string) => ({
      method: "PUT",
      url: `/api/ads/update-states/${id}/status`,
    }),
    update_ad: (id: number | string) => ({
      method: "PUT",
      url: `/api/ads/update-ad/${id}`,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
    delete_ad: (id: number | string) => ({
      method: "DELETE",
      url: `/api/ads/delete-add/${id}`,
    }),
  },
};

export default SummaryApi;
