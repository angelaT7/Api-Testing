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