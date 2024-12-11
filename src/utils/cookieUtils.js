export const getCookie = (name) => {
  // Check if we are in the browser
  if (typeof document === "undefined") {
    return undefined; // or handle it as needed
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }

  return null; // Return null if cookie not found
};
