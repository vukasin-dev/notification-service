const getRequest = async (url, jwt) => {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Authorization": `Bearer ${jwt}`,
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    });
    return response.json();
  };
  
  const postRequest = async (url, data) => {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    return response.json();
  };
  
  export {postRequest, getRequest};
  