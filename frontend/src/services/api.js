import axios from 'axios';

// Base URL for all API calls
const API = axios.create({
  baseURL: 'http://localhost:5093/api',
  headers: { 'Content-Type': 'application/json' }
});

// ── Travel Requests ──────────────────────────────────────────────────────
export const getAllRequests      = ()            => API.get('/travelrequest');
export const getRequestById      = (id)          => API.get(`/travelrequest/${id}`);
export const getRequestsByEmp    = (empId)       => API.get(`/travelrequest/employee/${empId}`);
export const submitRequest       = (data)        => API.post('/travelrequest', data);
export const updateRequestStatus = (id, status)  => API.put(`/travelrequest/${id}/status`, JSON.stringify(status));

// ── Approvals ────────────────────────────────────────────────────────────
export const submitApproval      = (data)        => API.post('/approval', data);
export const getApprovalsByReq   = (reqId)       => API.get(`/approval/request/${reqId}`);

// ── Itineraries ──────────────────────────────────────────────────────────
export const createItinerary     = (data)        => API.post('/itinerary', data);
export const getItineraryByReq   = (reqId)       => API.get(`/itinerary/request/${reqId}`);

// ── Employees ────────────────────────────────────────────────────────────
export const getAllEmployees      = ()            => API.get('/employee');
export const deleteRequest = (id) => API.delete(`/travelrequest/${id}`);