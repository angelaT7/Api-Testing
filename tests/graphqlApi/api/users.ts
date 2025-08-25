import { APIRequestContext } from "@playwright/test";
import * as fs from 'fs'; 
import * as path from 'path';

const filePath = path.join(__dirname, 'data/arrayUsers.json');
const userData = JSON.parse(fs.readFileSync('..\\Api-Testing\\tests\\graphqlApi\\data\\arrayUsers.json', 'utf-8')) as Array<{
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}>;

export class usersClass {
  readonly apiCallsForUsers: APIRequestContext;
  readonly fetchUsers: typeof userData;

  constructor(request: APIRequestContext) {
    this.apiCallsForUsers = request;
    this.fetchUsers = userData;
  }

  
  async getUserById(id: string | number): Promise<{ status: number; user: any }> {
    const query = `
      query {
        user(id: ${typeof id === "string" ? `"${id}"` : id}) {
          id
          name
          username
          email
          phone
          website
        }
      }
    `;

    const response = await this.apiCallsForUsers.post("/api", { data: { query } });
    const body = await response.json();

    return {
      status: response.status(),
      user: body.data.user
    };
  }

  async createUser(user: {
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}): Promise<{ status: number; user: any }> {
  const mutation = `
    mutation {
      createUser(input: {
        name: "${user.name}"
        username: "${user.username}"
        email: "${user.email}"
        ${user.phone ? `phone: "${user.phone}"` : ""}
        ${user.website ? `website: "${user.website}"` : ""}
      }) {
        id
        name
        username
        email
        phone
        website
      }
    }
  `;

  const response = await this.apiCallsForUsers.post("/api", { data: { query: mutation } });
  const body = await response.json();

  return {
    status: response.status(),
    user: body.data.createUser
  };
}

  
  async getAllUsers(): Promise<{ status: number; users: any[] }> {
    const query = `
      query {
        users {
          data {
            id
            name
            username
            email
            phone
            website
          }
        }
      }
    `;

    const response = await this.apiCallsForUsers.post("/api", { data: { query } });
    const body = await response.json();

    return {
      status: response.status(),
      users: body.data.users.data || []
    };
  }

  
  async deleteUser(id: string | number): Promise<{ status: number; result: boolean }> {
    const mutation = `
      mutation {
        deleteUser(id: "${typeof id === "string" ? id : id.toString()}")
      }
    `;

    const response = await this.apiCallsForUsers.post("/api", { data: { query: mutation } });
    const body = await response.json();

    return {
      status: response.status(),
      result: body.data.deleteUser
    };
  }

 
  async getUsersWithPagination(page: number = 1, limit: number = 10): Promise<{ status: number; users: any[]; pagination: any }> {
    const query = `
      query {
        users(options: { paginate: { page: ${page}, limit: ${limit} } }) {
          data {
            id
            name
            username
            email
            phone
            website
          }
          meta {
            totalCount
          }
        }
      }
    `;

    const response = await this.apiCallsForUsers.post("/api", { data: { query } });
    const body = await response.json();

    
    if (body.errors) {
      console.error("GraphQL errors:", body.errors);
    }

    const users = body.data?.users?.data || [];
    const meta = body.data?.users?.meta || {};
    
    
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
      users,
      pagination
    };
  }  
}
