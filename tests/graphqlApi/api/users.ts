import { APIRequestContext } from "@playwright/test";
import * as fs from 'fs'; 

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

  // Fetch user by ID and return both status and user
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
}

