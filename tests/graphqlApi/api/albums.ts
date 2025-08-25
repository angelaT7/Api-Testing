import { APIRequestContext } from "@playwright/test";
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '../data/arrayAlbums.json'); // correct relative path
const albumData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<{
  title: string;
  userid: string | number;
}>;


export class albumsClass {
  readonly apiCallsForAlbums: APIRequestContext;
  readonly fetchAlbums: typeof albumData;

  constructor(request: APIRequestContext) {
    this.apiCallsForAlbums = request;
    this.fetchAlbums = albumData;
  }

  
  async getAlbumById(id: string | number): Promise<{ status: number; album: any }> {
    const query = `
      query {
        album(id: ${typeof id === "string" ? `"${id}"` : id}) {
          id
          title
          user {
            name
          }
        }
      }
    `;

    const response = await this.apiCallsForAlbums.post("/api", { data: { query } });
    const body = await response.json();

    return {
      status: response.status(),
      album: body.data.album
    };
  }

  async createAlbum(album: {
  title: string;
  userId: string | number;
}): Promise<{ status: number; album: any }> {
  const mutation = `
    mutation {
      createAlbum(input: {
        title: "${album.title}"
        userId: ${typeof album.userId === "string" ? `"${album.userId}"` : album.userId}
      }) {
        id
        title
        user {
          name
        }
      }
    }
  `;

  const response = await this.apiCallsForAlbums.post("/api", { data: { query: mutation } });
  const body = await response.json();

  return {
    status: response.status(),
    album: body.data.createAlbum
  };
}

  
  async getAllAlbums(): Promise<{ status: number; albums: any[] }> {
    const query = `
      query {
        albums {
          data {
            id
            title
            user {
              name
            }
          }
        }
      }
    `;

    const response = await this.apiCallsForAlbums.post("/api", { data: { query } });
    const body = await response.json();

    return {
      status: response.status(),
      albums: body.data.albums.data || []
    };
  }

  
  async deleteAlbum(id: string | number): Promise<{ status: number; result: boolean }> {
    const mutation = `
      mutation {
        deleteAlbum(id: "${typeof id === "string" ? id : id.toString()}")
      }
    `;

    const response = await this.apiCallsForAlbums.post("/api", { data: { query: mutation } });
    const body = await response.json();

    return {
      status: response.status(),
      result: body.data.deleteAlbum
    };
  }

  
  async getAlbumsWithPagination(page: number = 1, limit: number = 10): Promise<{ status: number; albums: any[]; pagination: any }> {
    const query = `
      query {
        albums(options: { paginate: { page: ${page}, limit: ${limit} } }) {
          data {
            id
            title
            user {
              name
            }
          }
          meta {
            totalCount
          }
        }
      }
    `;

    const response = await this.apiCallsForAlbums.post("/api", { data: { query } });
    const body = await response.json();

    
    if (body.errors) {
      console.error("GraphQL errors:", body.errors);
    }

    const albums = body.data?.albums?.data || [];
    const meta = body.data?.albums?.meta || {};
    
    
    const totalCount = meta.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.max(1, page); 
    
    const pagination = {
      currentPage,
      limit,
      totalCount,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };

    return {
      status: response.status(),
      albums,
      pagination
    };
  }  
}