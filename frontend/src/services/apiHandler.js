const BASE_URL = "http://127.0.0.1:8000";

const apiHandler = async ({
  url,
  method,
  headers = null,
  body = null,
  logout,
}) => {
  try {
    let res = await fetch(`${BASE_URL}${url}`, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : null,
    });
    console.log(res);
    if (res.status == 401) {
      if (logout) logout(); // auto logout
      console.log(res);
      return null;
    }

    let data = await res.json();
    console.log(data);

    return data;
  } catch (error) {
    if (error == 401) console.log(error);
  }
};
export default apiHandler;
