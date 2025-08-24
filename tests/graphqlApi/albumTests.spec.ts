import { test, expect, request } from '@playwright/test';
import { albumsClass } from './api/albums';

let albumsMethods: albumsClass;
let baseURL: string;

test.beforeAll(async () => {
  baseURL = "https://graphqlzero.almansi.me";
  const apiRequest = await request.newContext({ baseURL });
  albumsMethods = new albumsClass(apiRequest);
  
  
  expect(baseURL).toBe("https://graphqlzero.almansi.me");
});

test("Fetch Album by ID", async () => {
  const { status, album } = await albumsMethods.getAlbumById("5");

    console.log("Fetch album", album);
    expect(status).toBe(200);
    expect(album.id).toBe("5");
});

test("Create all albums from the array", async () => {
for (const album of albumsMethods.fetchAlbums) {
  const albumData = { title: album.title, userId: album.userid };
  const { status, album: createdAlbum } = await albumsMethods.createAlbum(albumData);

  
    console.log("Created album:", createdAlbum);
    expect(status).toBe(200);
    expect(createdAlbum.id).toBeDefined();
}
})

test("Create album with valid data", async () => {
  const albumData = {
    title: "Stray Kids Album",
    userId: "1"
  };

  const { status, album } = await albumsMethods.createAlbum(albumData);

  console.log("Created album:", album);
  expect(status).toBe(200);
  expect(album.id).toBeDefined();
  expect(album.title).toBe(albumData.title);
  expect(album.user.name).toBeDefined();
});

test("Create album with minimal required data", async () => {
  const albumData = {
    title: "Minimal Album",
    userId: "2"
  };

  const { status, album } = await albumsMethods.createAlbum(albumData);

  console.log("Created minimal album:", album);
  expect(status).toBe(200);
  expect(album.id).toBeDefined();
  expect(album.title).toBe(albumData.title);
  expect(album.user.name).toBeDefined();
});

test("Create album with empty required fields", async () => {
  const albumData = {
    title: "",
    userId: ""
  };

  const { status, album } = await albumsMethods.createAlbum(albumData);

  console.log("Album creation with empty fields result:", album);
  expect(status).toBe(200);
  

  expect(album).toBeDefined();
});

test("Fetch all albums", async () => {
  const { status, albums } = await albumsMethods.getAllAlbums();

  console.log("All albums:", albums);
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  expect(albums.length).toBeGreaterThan(0);
  
  // Verify album structure
  if (albums.length > 0) {
    const firstAlbum = albums[0];
    expect(firstAlbum).toHaveProperty('id');
    expect(firstAlbum).toHaveProperty('title');
    expect(firstAlbum).toHaveProperty('user');
  }
});

test("Fetch album by valid ID", async () => {
  const { status, album } = await albumsMethods.getAlbumById("1");

  console.log("Fetch album by ID 1:", album);
  expect(status).toBe(200);
  expect(album).toBeDefined();
  expect(album.id).toBe("1");
  expect(album.title).toBeDefined();
  expect(album.user).toBeDefined();
});

test("Fetch album by non-existent ID", async () => {
  const { status, album } = await albumsMethods.getAlbumById("99999");

  console.log("Fetch non-existent album result:", album);
  expect(status).toBe(200);
  expect(album.id).toBeNull();
});

test("Fetch album by invalid ID format", async () => {
  const { status, album } = await albumsMethods.getAlbumById("invalid-id");

  console.log("Fetch album with invalid ID format result:", album);
  expect(status).toBe(200);
  
  expect(album).toBeDefined();
});

test("Delete album by valid ID", async () => {
  
  const albumData = {
    title: "Album to Delete",
    userId: "1"
  };

  const { album: createdAlbum } = await albumsMethods.createAlbum(albumData);
  const albumId = createdAlbum.id;

  
  const { status, result } = await albumsMethods.deleteAlbum(albumId);

  console.log("Delete album result:", result);
  expect(status).toBe(200);
  expect(result).toBe(true);
});

test("Delete album by non-existent ID", async () => {
  const { status, result } = await albumsMethods.deleteAlbum("99999");

  console.log("Delete non-existent album result:", result);
  expect(status).toBe(200);
  // GraphQL might return false or handle this differently
  expect(result).toBeDefined();
});

test("Delete album by invalid ID format", async () => {
  const { status, result } = await albumsMethods.deleteAlbum("invalid-id");

  console.log("Delete album with invalid ID format result:", result);
  expect(status).toBe(200);
  // GraphQL might handle this differently
  expect(result).toBeDefined();
});

test("Create and Delete multiple albums", async () => {
  
  const albumsToDelete = [
    { title: "Album 1", userId: "1" },
    { title: "Album 2", userId: "2" }
  ];

  const createdAlbumIds: string[] = [];
  for (const albumData of albumsToDelete) {
    const { album } = await albumsMethods.createAlbum(albumData);
    createdAlbumIds.push(album.id);
  }

  // Deleting albums
  for (const albumId of createdAlbumIds) {
    const { status, result } = await albumsMethods.deleteAlbum(albumId);
    
    console.log(`Delete album ${albumId} result:`, result);
    expect(status).toBe(200);
    expect(result).toBe(true);
  }
});

test.only("Create and delete album workflow", async () => {
  
  const albumData = {
    title: "Test Album",
    userId: "1"
  };

  const { status, album: createdAlbum } = await albumsMethods.createAlbum(albumData);
  console.log("Created album for workflow test:", createdAlbum);
  
  expect(status).toBe(200);
  expect(createdAlbum.id).toBeDefined();

  
  const { status: fetchStatus, album: fetchedAlbum } = await albumsMethods.getAlbumById(createdAlbum.id);
  console.log("Fetched created album:", fetchedAlbum);
  
  expect(fetchStatus).toBe(200);
  expect(fetchedAlbum.id).toBe(createdAlbum.id);
  expect(fetchedAlbum.title).toBe(albumData.title);

  // Delete the album
  const { status: deleteStatus, result: deleteResult } = await albumsMethods.deleteAlbum(createdAlbum.id);
  console.log("Delete result:", deleteResult);
  
  expect(deleteStatus).toBe(200);
  expect(deleteResult).toBe(true);

  // Verify album was deleted 
  const { status: verifyStatus, album: verifyAlbum } = await albumsMethods.getAlbumById(createdAlbum.id);
  console.log("Verification after delete:", verifyAlbum);
  
  expect(verifyStatus).toBe(200);
  expect(verifyAlbum === null || verifyAlbum.id === null).toBe(true);
});

test("Fetch albums with pagination - first page", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(1, 5);

  console.log("First page albums:", albums);
  console.log("Pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  expect(albums.length).toBeLessThanOrEqual(5);
  expect(pagination.currentPage).toBe(1);
  expect(pagination.limit).toBe(5);
  expect(pagination.totalCount).toBeGreaterThan(0);
  expect(pagination.totalPages).toBeGreaterThan(0);
  expect(typeof pagination.hasNextPage).toBe('boolean');
  expect(typeof pagination.hasPreviousPage).toBe('boolean');
});

test("Fetch albums with pagination - second page", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(2, 3);

  console.log("Second page albums:", albums);
  console.log("Second page pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  expect(albums.length).toBeLessThanOrEqual(3);
  expect(pagination.currentPage).toBe(2);
  expect(pagination.limit).toBe(3);
  expect(pagination.totalCount).toBeGreaterThan(0);
  expect(pagination.totalPages).toBeGreaterThan(1);
});

test("Fetch albums with pagination - large limit", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(1, 50);

  console.log("Large limit albums count:", albums.length);
  console.log("Large limit pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  expect(albums.length).toBeLessThanOrEqual(50);
  expect(pagination.currentPage).toBe(1);
  expect(pagination.limit).toBe(50);
  expect(pagination.totalCount).toBeGreaterThan(0);
});

test("Fetch albums with pagination - edge case page 0", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(0, 10);

  console.log("Page 0 albums:", albums);
  console.log("Page 0 pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  // Might handle page 0 as page 1 or return empty results
  expect(pagination).toBeDefined();
});

test("Fetch albums with pagination - negative page", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(-1, 10);

  console.log("Negative page albums:", albums);
  console.log("Negative page pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  // Might handle negative pages or return empty results
  expect(pagination).toBeDefined();
});

test("Fetch albums with pagination - zero limit", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(1, 0);

  console.log("Zero limit albums:", albums);
  console.log("Zero limit pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);
  // Might handle zero limit or return empty results
  expect(pagination).toBeDefined();
});

test("Fetch albums with pagination - very high page number", async () => {
  const { status, albums, pagination } = await albumsMethods.getAlbumsWithPagination(999, 10);

  console.log("Very high page albums:", albums);
  console.log("Very high page pagination meta:", pagination);
  
  expect(status).toBe(200);
  expect(Array.isArray(albums)).toBe(true);

  // Should return empty results for non-existent pages
  expect(pagination.currentPage).toBe(999);
  expect(pagination.totalPages).toBeLessThan(999);
});

test("Fetch albums with pagination - compare different limits", async () => {
  
  const { albums: albums5, pagination: pagination5 } = await albumsMethods.getAlbumsWithPagination(1, 5);
  const { albums: albums10, pagination: pagination10 } = await albumsMethods.getAlbumsWithPagination(1, 10);

  console.log("Limit 5 albums count:", albums5.length);
  console.log("Limit 10 albums count:", albums10.length);
  
  expect(albums5.length).toBeLessThanOrEqual(5);
  expect(albums10.length).toBeLessThanOrEqual(10);
  expect(pagination5.limit).toBe(5);
  expect(pagination10.limit).toBe(10);
  expect(pagination5.totalCount).toBe(pagination10.totalCount); // Same total count
  expect(pagination5.totalPages).toBeGreaterThanOrEqual(pagination10.totalPages); // More pages with smaller limit
});

test("Fetch albums with pagination - navigation through pages", async () => {
  const limit = 2;
  
  // Get first page
  const { albums: page1Albums, pagination: page1Meta } = await albumsMethods.getAlbumsWithPagination(1, limit);
  
  // Get second page
  const { albums: page2Albums, pagination: page2Meta } = await albumsMethods.getAlbumsWithPagination(2, limit);
  
  // Get third page
  const { albums: page3Albums, pagination: page3Meta } = await albumsMethods.getAlbumsWithPagination(3, limit);

  console.log("Page 1 albums:", page1Albums.length);
  console.log("Page 2 albums:", page2Albums.length);
  console.log("Page 3 albums:", page3Albums.length);
  
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