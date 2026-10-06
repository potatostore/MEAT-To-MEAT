import { request } from "./client";
import { ENDPOINTS, USE_MOCK } from "./config";
import * as mock from "./mock/store";
import type {
  Address,
  AddressRequest,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  Member,
  SignupRequest,
  UpdateMemberRequest,
} from "./types";

export async function signup(body: SignupRequest): Promise<Member> {
  if (USE_MOCK) return mock.signup(body);
  return request<Member>(ENDPOINTS.auth.signup, { method: "POST", body });
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) return mock.login(body);
  return request<LoginResponse>(ENDPOINTS.auth.login, { method: "POST", body });
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return;
  return request<void>(ENDPOINTS.auth.logout, { method: "POST" });
}

export async function getMe(): Promise<Member> {
  if (USE_MOCK) return mock.getMe();
  return request<Member>(ENDPOINTS.members.me);
}

export async function updateMe(body: UpdateMemberRequest): Promise<Member> {
  if (USE_MOCK) return mock.updateMe(body);
  return request<Member>(ENDPOINTS.members.me, { method: "PATCH", body });
}

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
  if (USE_MOCK) return mock.changePassword(body);
  return request<void>(ENDPOINTS.members.password, { method: "PATCH", body });
}

export async function withdraw(): Promise<void> {
  if (USE_MOCK) return mock.withdraw();
  return request<void>(ENDPOINTS.members.me, { method: "DELETE" });
}

export async function getAddresses(): Promise<Address[]> {
  if (USE_MOCK) return mock.getAddresses();
  return request<Address[]>(ENDPOINTS.members.addresses);
}

export async function createAddress(body: AddressRequest): Promise<Address> {
  if (USE_MOCK) return mock.createAddress(body);
  return request<Address>(ENDPOINTS.members.addresses, { method: "POST", body });
}

export async function updateAddress(id: number, body: AddressRequest): Promise<Address> {
  if (USE_MOCK) return mock.updateAddress(id, body);
  return request<Address>(ENDPOINTS.members.address(id), { method: "PATCH", body });
}

export async function deleteAddress(id: number): Promise<void> {
  if (USE_MOCK) return mock.deleteAddress(id);
  return request<void>(ENDPOINTS.members.address(id), { method: "DELETE" });
}
