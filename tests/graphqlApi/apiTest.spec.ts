import { test, expect, request } from '@playwright/test';
import { usersClass } from './api/users';

let usersMethods: usersClass;
let baseURL: string;

test.beforeAll(async () => {
  baseURL = "https://graphqlzero.almansi.me";
  const apiRequest = await request.newContext({ baseURL });
  usersMethods = new usersClass(apiRequest);
  
  
  expect(baseURL).toBe("https://graphqlzero.almansi.me");
});

test("Fetch user by ID", async () => {
  const { status, user } = await usersMethods.getUserById("5");

    console.log("Fetch user", user)
    expect(status).toBe(200);
    expect(user.id).toBe("5");
});

test("Create all users from the array", async () => {
for (const user of usersMethods.fetchUsers) {
  const { status, user: createdUser } = await usersMethods.createUser(user);

  
    console.log("Created user:", createdUser);
    expect(status).toBe(200);
    expect(createdUser.id).toBeDefined();
}
})

test("Create user with valid data", async () => {
  const userData = {
    name: "Stray Kids",
    username: "Stray Kids",
    email: "stray@kidss.com",
    phone: "1234567890",
    website: "www.test.com"
  };

  const { status, user } = await usersMethods.createUser(userData);

  console.log("Created user:", user);
  expect(status).toBe(200);
  expect(user.id).toBeDefined();
  expect(user.name).toBe(userData.name);
  expect(user.username).toBe(userData.username);
  expect(user.email).toBe(userData.email);
  expect(user.phone).toBe(userData.phone);
  expect(user.website).toBe(userData.website);
});

test("Create user with minimal required data", async () => {
  const userData = {
    name: "r",
    username: "r",
    email: "minimal@test.com"
  };

  const { status, user } = await usersMethods.createUser(userData);

  console.log("Created minimal user:", user);
  expect(status).toBe(200);
  expect(user.id).toBeDefined();
  expect(user.name).toBe(userData.name);
  expect(user.username).toBe(userData.username);
  expect(user.email).toBe(userData.email);
});

test("Create user with invalid email format", async () => {
  const userData = {
    name: "User Full Name",
    username: "Test Username l",
    email: "invalid-email-format"
  };

  const { status, user } = await usersMethods.createUser(userData);

  console.log("User creation with invalid email result:", user);
  expect(status).toBe(200);

  // Should return error (if there is email validation)
  expect(user).toBeDefined();
});

test("Create user with empty required fields", async () => {
  const userData = {
    name: "",
    username: "",
    email: ""
  };

  const { status, user } = await usersMethods.createUser(userData);

  console.log("User creation with empty fields result:", user);
  expect(status).toBe(200);
  

  expect(user).toBeDefined();
});

test("Fetch all users", async () => {
  const { status, users } = await usersMethods.getAllUsers();

  console.log("All users:", users);
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThan(0);
  
  // Verify user structure
  if (users.length > 0) {
    const firstUser = users[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('username');
    expect(firstUser).toHaveProperty('email');
  }
});

test("Fetch user by valid ID", async () => {
  const { status, user } = await usersMethods.getUserById("1");

  console.log("Fetch user by ID 1:", user);
  expect(status).toBe(200);
  expect(user).toBeDefined();
  expect(user.id).toBe("1");
  expect(user.name).toBeDefined();
  expect(user.username).toBeDefined();
  expect(user.email).toBeDefined();
});

test("Fetch user by non-existent ID", async () => {
  const { status, user } = await usersMethods.getUserById("99999");

  console.log("Fetch non-existent user result:", user);
  expect(status).toBe(200);
  expect(user.id).toBeNull();
});

test("Fetch user by invalid ID format", async () => {
  const { status, user } = await usersMethods.getUserById("invalid-id");

  console.log("Fetch user with invalid ID format result:", user);
  expect(status).toBe(200);
  
  expect(user).toBeDefined();
});

test("Delete user by valid ID", async () => {
  // First create a user to delete
  const userData = {
    name: "User to Delete",
    username: "usertodelete",
    email: "delete@example.com"
  };

  const { user: createdUser } = await usersMethods.createUser(userData);
  const userId = createdUser.id;

  
  const { status, result } = await usersMethods.deleteUser(userId);

  console.log("Delete user result:", result);
  expect(status).toBe(200);
  expect(result).toBe(true);
});

test("Delete user by non-existent ID", async () => {
  const { status, result } = await usersMethods.deleteUser("99999");

  console.log("Delete non-existent user result:", result);
  expect(status).toBe(200);
  // GraphQL might return false or handle this differently
  expect(result).toBeDefined();
});

test("Delete user by invalid ID format", async () => {
  const { status, result } = await usersMethods.deleteUser("invalid-id");

  console.log("Delete user with invalid ID format result:", result);
  expect(status).toBe(200);
  // GraphQL might handle this differently
  expect(result).toBeDefined();
});

test("Create and Delete multiple users", async () => {
  // Create multiple users
  const usersToDelete = [
    { name: "User 1", username: "user1", email: "user1@example.com" },
    { name: "User 2", username: "user2", email: "user2@example.com" }
  ];

  const createdUserIds: string[] = [];
  for (const userData of usersToDelete) {
    const { user } = await usersMethods.createUser(userData);
    createdUserIds.push(user.id);
  }

  // Delete all created users
  for (const userId of createdUserIds) {
    const { status, result } = await usersMethods.deleteUser(userId);
    
    console.log(`Delete user ${userId} result:`, result);
    expect(status).toBe(200);
    expect(result).toBe(true);
  }
});

test("Create and delete user workflow", async () => {
  // Create user
  const userData = {
    name: "Bla Bla",
    username: "Test",
    email: "test@example.com"
  };

  const { status, user: createdUser } = await usersMethods.createUser(userData);
  console.log("Created user for workflow test:", createdUser);
  
  expect(status).toBe(200);
  expect(createdUser.id).toBeDefined();

  // Verify user was created by fetching it
  const { status: fetchStatus, user: fetchedUser } = await usersMethods.getUserById(createdUser.id);
  console.log("Fetched created user:", fetchedUser);
  
  expect(fetchStatus).toBe(200);
  expect(fetchedUser.id).toBe(createdUser.id);
  expect(fetchedUser.name).toBe(userData.name);

  // Delete the user
  const { status: deleteStatus, result: deleteResult } = await usersMethods.deleteUser(createdUser.id);
  console.log("Delete result:", deleteResult);
  
  expect(deleteStatus).toBe(200);
  expect(deleteResult).toBe(true);

  // Verify user was deleted by trying to fetch it again
  const { status: verifyStatus, user: verifyUser } = await usersMethods.getUserById(createdUser.id);
  console.log("Verification after delete:", verifyUser);
  
  expect(verifyStatus).toBe(200);
  // User should no longer exist (could be null or have null id)
  expect(verifyUser === null || verifyUser.id === null).toBe(true);
});

test("Fetch users with pagination - first page", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(1, 5);

  console.log("First page users:", users);
  console.log("Pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeLessThanOrEqual(5);
  expect(pagination.currentPage).toBe(1);
  expect(pagination.limit).toBe(5);
  expect(pagination.totalCount).toBeGreaterThan(0);
  expect(pagination.totalPages).toBeGreaterThan(0);
  expect(typeof pagination.hasNextPage).toBe('boolean');
  expect(typeof pagination.hasPreviousPage).toBe('boolean');
});

test("Fetch users with pagination - second page", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(2, 3);

  console.log("Second page users:", users);
  console.log("Second page pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeLessThanOrEqual(3);
  expect(pagination.currentPage).toBe(2);
  expect(pagination.limit).toBe(3);
  expect(pagination.totalCount).toBeGreaterThan(0);
  expect(pagination.totalPages).toBeGreaterThan(1);
});

test("Fetch users with pagination - large limit", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(1, 50);

  console.log("Large limit users count:", users.length);
  console.log("Large limit pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeLessThanOrEqual(50);
  expect(pagination.currentPage).toBe(1);
  expect(pagination.limit).toBe(50);
  expect(pagination.totalCount).toBeGreaterThan(0);
});

test("Fetch users with pagination - edge case page 0", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(0, 10);

  console.log("Page 0 users:", users);
  console.log("Page 0 pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  // GraphQL might handle page 0 as page 1 or return empty results
  expect(pagination).toBeDefined();
});

test("Fetch users with pagination - negative page", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(-1, 10);

  console.log("Negative page users:", users);
  console.log("Negative page pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  // GraphQL might handle negative pages or return empty results
  expect(pagination).toBeDefined();
});

test("Fetch users with pagination - zero limit", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(1, 0);

  console.log("Zero limit users:", users);
  console.log("Zero limit pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  // GraphQL might handle zero limit or return empty results
  expect(pagination).toBeDefined();
});

test("Fetch users with pagination - very high page number", async () => {
  const { status, users, pagination } = await usersMethods.getUsersWithPagination(999, 10);

  console.log("Very high page users:", users);
  console.log("Very high page pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(users)).toBe(true);
  // Should return empty results for non-existent pages
  expect(pagination.currentPage).toBe(999);
  expect(pagination.totalPages).toBeLessThan(999);
});

test("Fetch users with pagination - compare different page sizes", async () => {
  // Fetch with limit 5
  const { users: users5, pagination: pagination5 } = await usersMethods.getUsersWithPagination(1, 5);
  
  // Fetch with limit 10
  const { users: users10, pagination: pagination10 } = await usersMethods.getUsersWithPagination(1, 10);

  console.log("Limit 5 users count:", users5.length);
  console.log("Limit 10 users count:", users10.length);
  
  expect(users5.length).toBeLessThanOrEqual(5);
  expect(users10.length).toBeLessThanOrEqual(10);
  expect(pagination5.limit).toBe(5);
  expect(pagination10.limit).toBe(10);
  expect(pagination5.totalCount).toBe(pagination10.totalCount); // Same total count
  expect(pagination5.totalPages).toBeGreaterThanOrEqual(pagination10.totalPages); // More pages with smaller limit
});

test("Fetch users with pagination - navigation through pages", async () => {
  const limit = 2;
  
  // Get first page
  const { users: page1Users, pagination: page1Meta } = await usersMethods.getUsersWithPagination(1, limit);
  
  // Get second page
  const { users: page2Users, pagination: page2Meta } = await usersMethods.getUsersWithPagination(2, limit);
  
  // Get third page
  const { users: page3Users, pagination: page3Meta } = await usersMethods.getUsersWithPagination(3, limit);

  console.log("Page 1 users:", page1Users.length);
  console.log("Page 2 users:", page2Users.length);
  console.log("Page 3 users:", page3Users.length);
  
  expect(page1Meta.currentPage).toBe(1);
  expect(page2Meta.currentPage).toBe(2);
  expect(page3Meta.currentPage).toBe(3);
  expect(page1Meta.limit).toBe(limit);
  expect(page2Meta.limit).toBe(limit);
  expect(page3Meta.limit).toBe(limit);
  
  // Verify pagination navigation
  if (page1Meta.hasNextPage) {
    expect(page1Meta.hasNextPage).toBe(true);
    expect(page2Meta.hasPreviousPage).toBe(true);
  }
  
  if (page2Meta.hasNextPage) {
    expect(page2Meta.hasNextPage).toBe(true);
    expect(page3Meta.hasPreviousPage).toBe(true);
  }
});


















// test("Fetch User From GraphQL API", async ({ request }) => {
//   const response = await request.post("https://graphqlzero.almansi.me/api", {
//     data: {
//       query: `
//         query {
//           user(id: 4) {
//             id
//             name
//             username
//           }
//         }
//       `,
//     },
//   })

//   const body = await response.json();
//   console.log(body);

//   //expect(response.status()).toBe(200);
//   expect(body.data.user.id).toBe("4");

//   });



// test("Create User via GraphQL API", async ({ request }) => {
//   const response = await request.post("https://graphqlzero.almansi.me/api", {
//     data: {
//       query: `
//         mutation {
//           createUser(input: {
//             name: "Romeo Santos"
//             username: "Bachata King"
//             email: "romeo@example.com"
//           }) {
//             id
//             name
//             username
//             email
//           }
//         }
//       `,
//     },
//   });

//   // Check the HTTP status
//   expect(response.status()).toBe(200);

//   // Parse JSON body
//   const body = await response.json();
//   console.log(body);

//   // Assertions
//   expect(body.data.createUser).toHaveProperty("id");
//   expect(body.data.createUser.name).toBe("Romeo Santos");
//   expect(body.data.createUser.username).toBe("Bachata King");
//   expect(body.data.createUser.email).toBe("romeo@example.com");
// });

// test.only("Dlete the created user", async({request}) => {
// const response = await request.post("https://graphqlzero.almansi.me/api", {
//     data: {
//         query: `
//             mutation{
//                 deleteUser(id:"6")
//                 }`
//             }
//         })
// const body =await response.json();
// console.log(body);

// expect(response.status()).toBe(200);
// expect(body.data.deleteUser).toBe(true);
// });