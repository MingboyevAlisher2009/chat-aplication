export const HOST = import.meta.env.VITE_SERVER_URL

export const AUTH_ROUTES = `/api/auth`
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/upadte-profile`
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/add-profile-image`
export const REMOVE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}//remove-profile-image`

export const CONTACTS_ROUTE = `/api/contacts`
export const CONTACTS_SEARCH_ROUTE = `${CONTACTS_ROUTE}/search`
export const CONTACTS_DM_ROUTE = `${CONTACTS_ROUTE}/get-contacts-for-dm`
export const CONTACTS_GET_ALL_ROUTE = `${CONTACTS_ROUTE}/get-all-contacts`

export const MESSAGES_ROUTE = `/api/messages`
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages`
export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTE}/upload-file`
export const DELETE_MESSAGE_FILE_ROUTE = `${MESSAGES_ROUTE}/delete-file`
