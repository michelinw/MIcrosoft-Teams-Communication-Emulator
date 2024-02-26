import { requestClear, requestRegister, requestProfile, requestUploadPicture } from './testHelper';

const OK = 200;
const INPUT_ERROR = 400;
const AUTH_ERROR = 403;

beforeEach(() => {
  requestClear();
});

type AuthUserId = {output: {token: string, authUserId: number}, statusCode: number}
type UserProfile = {output: {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string, profileImageUrl: string}, statusCode: number}

test('Testing valid scenario', () => {
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const imgUrl = 'http://lafeber.com/pet-birds/wp-content/uploads/2018/06/Parakeet.jpg';
  requestUploadPicture(userRegister.output.token, imgUrl, 0, 0, 400, 400);
  const profile = requestProfile(userRegister.output.token, userRegister.output.authUserId) as UserProfile;
  let isValid = true;
  if (profile.output.profileImageUrl === imgUrl) {
    isValid = false;
  }
  expect(profile.output).toStrictEqual({
    user: { uId: userRegister.output.authUserId, email: 'alan@unsw.edu.au', nameFirst: 'Alan', nameLast: 'Hattom', handleStr: expect.any(String), profileImageUrl: expect.any(String) },
  });
  expect(isValid).toStrictEqual(true);
  expect(profile.statusCode).toBe(OK);
});

test('testing invalid url', () => {
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const imgUrl = 'http://invalid.com';
  const upload = requestUploadPicture(userRegister.output.token, imgUrl, 0, 0, 400, 400);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(INPUT_ERROR);
});

test('testing dimension gievn are bigger than the actual image', () => {
  const userRegister = requestRegister('h@unsw.edu.au', 'password123', 'h', 'p') as AuthUserId;
  const imgUrl = 'http://lafeber.com/pet-birds/wp-content/uploads/2018/06/Parakeet.jpg';
  const upload = requestUploadPicture(userRegister.output.token, imgUrl, 0, 0, 800, 800);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(INPUT_ERROR);
});

test('testing non .jpg format', () => {
  const userRegister = requestRegister('alan@unsw.edu.au', 'password123', 'Alan', 'Hattom') as AuthUserId;
  const imgUrl = 'http://cdn.pixabay.com/photo/2015/10/01/17/17/car-967387__480.png';
  const upload = requestUploadPicture(userRegister.output.token, imgUrl, 0, 0, 800, 300);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(INPUT_ERROR);
});

test('testing dimension given xEnd is equal to yStart', () => {
  const userRegister = requestRegister('h@unsw.edu.au', 'password123', 'h', 'p') as AuthUserId;
  const imgUrl = 'http://lafeber.com/pet-birds/wp-content/uploads/2018/06/Parakeet.jpg';
  const upload = requestUploadPicture(userRegister.output.token, imgUrl, 0, 20, 40, 2);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(INPUT_ERROR);
});

test('testing dimension given xEnd is -1', () => {
  const userRegister = requestRegister('h@unsw.edu.au', 'password123', 'h', 'p') as AuthUserId;
  const imgUrl = 'http://lafeber.com/pet-birds/wp-content/uploads/2018/06/Parakeet.jpg';
  const upload = requestUploadPicture(userRegister.output.token, imgUrl, 0, -1, 2, 400);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(INPUT_ERROR);
});

test('testing when token is invalid', () => {
  const userRegister = requestRegister('h@unsw.edu.au', 'password123', 'h', 'p') as AuthUserId;
  const imgUrl = 'http://lafeber.com/pet-birds/wp-content/uploads/2018/06/Parakeet.jpg';
  const upload = requestUploadPicture(userRegister.output.token + 20, imgUrl, 0, 0, 40, 40);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(AUTH_ERROR);
});

test('testing when img does not exist', () => {
  const userRegister = requestRegister('h@unsw.edu.au', 'password123', 'h', 'p') as AuthUserId;
  const imgUrl = 'http://lafeber.com/pet-birds/wp-content/uploads/2018/06/Fake.jpg';
  const upload = requestUploadPicture(userRegister.output.token, imgUrl, 0, 0, 40, 40);
  expect(upload.output).toStrictEqual({ error: { message: expect.any(String) } });
  expect(upload.statusCode).toBe(INPUT_ERROR);
});
