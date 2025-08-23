import { test, expect, request } from '@playwright/test';
import { usersClass } from './api/users';

let usersMethods: usersClass;

test.beforeAll(async () => {
  const apiRequest = await request.newContext({ baseURL: "https://graphqlzero.almansi.me" });
  usersMethods = new usersClass(apiRequest);
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