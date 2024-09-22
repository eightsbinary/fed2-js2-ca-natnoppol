import { getCurrentUser } from "../utilities/currentUser.js";
import { API_AUTH_KEY } from "./constants.js";
import { headers } from "./headers.js";
import { initializeAPI } from "./constants.js";


export default class NoroffAPI {
  apiBase = "";
  postId = "";

  constructor(apiBase = "https://v2.api.noroff.dev") {
    this.apiBase = apiBase;
  }

  get getCurrentUser() {
    return getCurrentUser();
  }
  get apiLoginPath() {
    return `${this.apiBase}/auth/login`;
  }

  get apiRegisterPath() {
    return `${this.apiBase}/auth/register`;
  }

  get apiSocialPath() {
    return `${this.apiBase}/social/posts`;
  }

  get apiProfilesPath (){
    return `${this.apiBase}/social/profiles`
  }

  auth = {
    login: async ({ email, password }) => {
      const body = JSON.stringify({ email, password });

      const response = await fetch(this.apiLoginPath, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "post",
        body,
      });

      if (response.ok) {
        const { data } = await response.json();
        const { accessToken: token, ...user } = data;
        localStorage.token = token;
        localStorage.user = JSON.stringify(user);

        return data;
      }
      throw new Error("Could not login with this account");
    },
    register: async ({ name, email, password }) => {
      const body = JSON.stringify({ name, email, password });

      const response = await fetch(this.apiRegisterPath, {
        headers: { "Content-Type": "application/json" },
        method: "post",
        body,
      });

      if (response.ok) {
        const { data } = await response.json();
        return data;
      }

      throw new Error("Could not register this account");
    },

    logout: async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    },
  };

  post = {
    read: async (id, option = {}) => {
      const apiKey = await initializeAPI();
      const customHeaders = headers(apiKey);
  
      let url = `${this.apiSocialPath}/${id}`;

      if (option._author){
        
       url += "?_author="+ option._author

       }
      const response = await fetch(url, {
        headers: customHeaders,
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      throw new Error("Could not create post");
    },
    update: async (id, {title, body, tags, media }) => {
      const apiKey = await initializeAPI();
      const customHeaders = headers(apiKey);

      const tagsArray = Array.isArray(tags) ? tags : tags.split (',').map (tag => tag.trim());
      const formattedMedia = {
        url: media || '',
        alt: media.alt || ''
      }
      const requestBody = {
        title,
        body,
        tags: tagsArray,
        media: formattedMedia
      };

      const response = await fetch(`${this.apiSocialPath}/${id}`, {
        headers: customHeaders,
        method: "put",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href="/"
        alert("Post has been editet")

        return data;
      }

      throw new Error("Could not update post" + id);
    },
    delete: async (id) => {
      const apiKey = await initializeAPI();
      const customHeaders = headers(apiKey);

      const response = await fetch(`${this.apiSocialPath}/${id}`, {
        method: "delete",
        headers: customHeaders,
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json(); 
          return data;
        } else {
          window.location.href = "/";
          return; 
        }
      }

      throw new Error("Could not delete post" + id);
    },
    create: async ({ title, body, tags, media }) => {
      
      const apiKey = await initializeAPI();
      const customHeaders = headers(apiKey);

      const tagsArray = Array.isArray(tags) ? tags : tags.split (',').map (tag => tag.trim())
      const formattedMedia = {
        url: media || '',
        alt: media.alt || ''
      }
      const requestBody = {
        title,
        body,
        tags: tagsArray,
        media: formattedMedia
      };


      const response = await fetch(this.apiSocialPath, {
        method: "post",
        headers: customHeaders,
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        this.postId = data.id
        return data;
      }

      throw new Error("Could not create post");
    },
  };

  search = {
    read: async (query) => {
      const apiKey = await initializeAPI();
      const customHeaders = headers(apiKey);

      const url = new URL(`${this.apiSocialPath}/search`);
      url.searchParams.append('q', query);

      const response = await fetch(url,{
        headers: customHeaders(apiKey),
        method:"get",
      });

      if(response.ok){
        const data = await response.json();
        return data;
      }
      throw new Error("Could not fetch posts")
    },
    readProfile: async (query) => {
      const {token} = getCurrentUser();
      const apiKeyData = await this.options.apiKey();

      const url = new URL(`${this.apiSocialPath}/search`);
      url.searchParams.append('q', query);

      const response = await fetch(url,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
           "X-Noroff-API-Key": `${apiKeyData.data.key}`
        },method:"get",
      });

      if(response.ok){
        const data = await response.json();
        
        return data;
      }
      
      throw new Error("Could not fetch posts")
    }
  };

  profileByName = {
    read: async (name, option = {}) => {

      const { token} = getCurrentUser();

      let url = `${this.apiProfilesPath}/${name}`;

      if (option._posts){
        
       url += "?_posts="+ option._posts

       }

      const apiKeyData = await this.options.apiKey();

      const response = await fetch (url,{
        medthod:"get",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
           "X-Noroff-API-Key": `${apiKeyData.data.key}`
        }
      })

      if(response.ok){
          const data = await response.json()
          return data;
      }
      else {
        throw new Error("could not read the Profile");
      }
    },
  }

  getPosts = async () => {
    const { token } = this.getCurrentUser;

    
    const apiKeyData = await this.options.apiKey();

    const response = await fetch(`${this.apiSocialPath}`, {
      method: "get",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": `${apiKeyData.data.key}`
        
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error("could not read the posts");
  };
  getProfiles= async () => {
    const { token } = this.getCurrentUser;
    const apiKeyData = await this.options.apiKey();

    const response = await fetch(`${this.apiProfilesPath}`, {
      method: "get",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": `${apiKeyData.data.key}`
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error("Failed to fetch profiles");
  };
  options = {
    apiKey: async () => {
      const { token } = this.getCurrentUser;

      const options = {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(`${API_AUTH_KEY}`, options);

      if (response.ok) {
        const data = await response.json();

        return data;

      } else {
        throw new Error("Failed to fetch options");
      }
    },
  };
}
