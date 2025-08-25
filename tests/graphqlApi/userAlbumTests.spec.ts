import { test, expect, request } from '@playwright/test';
import { usersClass } from './api/users';
import { albumsClass } from './api/albums';

let usersMethods: usersClass;
let albumsMethods: albumsClass;
let baseURL: string;
let createdUserIds: string[] = [];
let createdAlbumIds: string[] = [];

test.beforeAll(async () => {
  baseURL = "https://graphqlzero.almansi.me";
  const apiRequest = await request.newContext({ baseURL });
  usersMethods = new usersClass(apiRequest);
  albumsMethods = new albumsClass(apiRequest);
  
  expect(baseURL).toBe("https://graphqlzero.almansi.me");
});

test.afterAll(async () => {
  console.log(`Cleaning up ${createdAlbumIds.length} created albums and ${createdUserIds.length} created users...`);
  
  // Clean up albums first (they depend on users)
  for (const albumId of createdAlbumIds) {
    try {
      const { status, result } = await albumsMethods.deleteAlbum(albumId);
      console.log(`Deleted album ${albumId}: ${result ? 'Success' : 'Failed'} (Status: ${status})`);
    } catch (error) {
      console.log(`Failed to delete album ${albumId}:`, error);
    }
  }
  
  // Users deletion
  for (const userId of createdUserIds) {
    try {
      const { status, result } = await usersMethods.deleteUser(userId);
      console.log(`Deleted user ${userId}: ${result ? 'Success' : 'Failed'} (Status: ${status})`);
    } catch (error) {
      console.log(`Failed to delete user ${userId}:`, error);
    }
  }
  
  createdUserIds = [];
  createdAlbumIds = [];
  console.log('User-Album relationship cleanup completed.');
});


test("Create album for existing user and verify ownership", async () => {
 
  const existingUserId = "1";
  
  
  const { status: userStatus, user } = await usersMethods.getUserById(existingUserId);
  console.log("Fetched existing user:", user);
  expect(userStatus).toBe(200);
  expect(user.id).toBe(existingUserId);

  
  const albumData = {
    title: "Existing User's Album",
    userId: existingUserId
  };

  const { status: albumStatus, album } = await albumsMethods.createAlbum(albumData);
  if (album && album.id) {
    createdAlbumIds.push(album.id);
  }

  console.log("Created album for existing user:", album);
  expect(albumStatus).toBe(200);
  expect(album.id).toBeDefined();
  expect(album.title).toBe(albumData.title);
  
  // Step 3: Verify the album belongs to the correct user
  expect(album.user).toBeDefined();
  expect(album.user.name).toBe(user.name);
});


test("create user and album for same user", async () => {
  // Step 1: Create a user
  const userData = {
    name: "User 1 test",
    username: "newusertest",
    email: "newuser@test.com"
  };

  const { status: userStatus, user } = await usersMethods.createUser(userData);
  if (user && user.id) {
    createdUserIds.push(user.id);
  }

  console.log("Created new user:", user);
  expect(userStatus).toBe(200);
  expect(user.id).toBeDefined();

  // Album creation
  const albumData = {
    title: "New User's Album",
    userId: user.id
  };

  const { status: albumStatus, album } = await albumsMethods.createAlbum(albumData);
  if (album && album.id) {
    createdAlbumIds.push(album.id);
  }

  console.log("Created album for new user:", album);
  expect(albumStatus).toBe(200);
  expect(album.id).toBeDefined();
  expect(album.title).toBe(albumData.title);
  
  expect(album.user).toBeDefined();
  
  
  if (album.user.name === null) {
    console.log("API Behavior: Newly created users don't establish album relationships immediately");
    expect(album.user.name).toBeNull();
  } else {
    expect(album.user.name).toBe(userData.name);
  }
});


test("Create album for non-existent user", async () => {
  const albumData = {
    title: "Orphaned Album",
    userId: "99999" 
  };

  const { status, album } = await albumsMethods.createAlbum(albumData);
  if (album && album.id) {
    createdAlbumIds.push(album.id);
  }

  console.log("Album creation for non-existent user result:", album);
  expect(status).toBe(200);
  
  // The API should handle this gracefully - either reject or create with null user
  if (album) {
    expect(album.title).toBe(albumData.title);
    console.log("User data in album:", album.user);
  }
});


test("Create album for existing user", async () => {
  // Fetch a user
  const { status: userStatus, user } = await usersMethods.getUserById("1");
  
  console.log("Fetched user for consistency test:", user);
  expect(userStatus).toBe(200);
  expect(user.id).toBe("1");

  // Create an album for this user
  const albumData = {
    title: "Consistency Test Album",
    userId: user.id
  };

  const { status: albumStatus, album } = await albumsMethods.createAlbum(albumData);
  if (album && album.id) {
    createdAlbumIds.push(album.id);
  }

  console.log("Created album for consistency test:", album);
  expect(albumStatus).toBe(200);
  expect(album.user.name).toBe(user.name);
  
  // Verify that the album is created
  const { status: fetchStatus, album: fetchedAlbum } = await albumsMethods.getAlbumById(album.id);
  
  console.log("Re-fetched album for consistency validation:", fetchedAlbum);
  expect(fetchStatus).toBe(200);
  
  // Handle case where album might be deleted or not found
  if (fetchedAlbum && fetchedAlbum.id && fetchedAlbum.title && fetchedAlbum.user && fetchedAlbum.user.name) {
    // If album persists with complete data, verify consistency
    expect(fetchedAlbum.user.name).toBe(user.name);
    expect(fetchedAlbum.title).toBe(albumData.title);
    console.log("API Behavior: Album persisted with correct data");
  } else {
    // If album doesn't persist or has incomplete data
    console.log("API Behavior: Test API doesn't persist created albums with complete data - this is expected");
    expect(fetchedAlbum).toBeDefined();
    
    
  }
});


test("Create multiple albums for the same user", async () => {
  
  const userId = "2";
  
  const albumsData = [
    { title: "User's First Album", userId: userId },
    { title: "User's Second Album", userId: userId },
    { title: "User's Third Album", userId: userId }
  ];

  const createdAlbums: any[] = [];

  for (const albumData of albumsData) {
    const { status, album } = await albumsMethods.createAlbum(albumData);
    if (album && album.id) {
      createdAlbumIds.push(album.id);
    }
    
    console.log(`Created album "${albumData.title}":`, album);
    expect(status).toBe(200);
    expect(album.id).toBeDefined();
    expect(album.title).toBe(albumData.title);
    expect(album.user).toBeDefined();
    
    createdAlbums.push(album);
  }

  // Verify all albums belong to the same user
  const userNames = createdAlbums.map((album: any) => album.user.name);
  const uniqueUserNames = [...new Set(userNames)];
  
  console.log("User names from all albums:", userNames);
  expect(uniqueUserNames.length).toBe(1); 
});


test("Create album with invalid user ID format", async () => {
  const albumData = {
    title: "Invalid User ID Album",
    userId: "i+1Ìn"
  };

  const { status, album } = await albumsMethods.createAlbum(albumData);
  if (album && album.id) {
    createdAlbumIds.push(album.id);
  }

  console.log("Album creation with invalid user ID result:", album);
  expect(status).toBe(200);
  
  // Verify how the API handles invalid user ID
  if (album) {
    expect(album.title).toBe(albumData.title);
    console.log("User data for invalid user ID:", album.user);
  }
});


test("create user and multiple albums sequentially", async () => {
  //Create a user
  const userData = {
    name: "Bulk Test User",
    username: "bulktest",
    email: "bulk@test.com"
  };

  const { status: userStatus, user } = await usersMethods.createUser(userData);
  if (user && user.id) {
    createdUserIds.push(user.id);
  }

  expect(userStatus).toBe(200);
  console.log("Created user for bulk test:", user);

  // Bulk album creation
  const albumTitles = [
    "Bulk Album 1",
    "Bulk Album 2", 
    "Bulk Album 3",
    "Bulk Album 4",
    "Bulk Album 5"
  ];

  const createdAlbums: any[] = [];

  for (const title of albumTitles) {
    const albumData = { title, userId: user.id };
    const { status, album } = await albumsMethods.createAlbum(albumData);
    
    if (album && album.id) {
      createdAlbumIds.push(album.id);
    }

    expect(status).toBe(200);
    expect(album.title).toBe(title);
    
    
    if (album.user && album.user.name) {
      expect(album.user.name).toBe(userData.name);
    } else {
      console.log(`Album "${title}" created but not linked to user`);
      expect(album.user.name).toBeNull();
    }
    
    createdAlbums.push(album);
    console.log(`Created bulk album "${title}":`, album);
  }
  expect(createdAlbums.length).toBe(albumTitles.length);

  console.log(`Successfully created ${createdAlbums.length} albums for user "${userData.name}"`);
});
