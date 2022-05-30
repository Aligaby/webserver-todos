const http = require("http");
const url = require("url");

const server = http.createServer();

const myData = [
  {
    id: 0,
    title: "Title 0",
    description: "Description 0",
    dueDate: "unknown",
    isComplete: false,
  },
];

const accesServer = {
  host: "localhost",
  port: 8080,
};

function getMethodOnlyId(idTodos, request, response) {
  const searchInArray = myData.filter((item) => item.id === +idTodos);
  response.setHeader("Content-Type", "application/json");
  response.writeHead(200);
  response.end(JSON.stringify(searchInArray));
}

function getMethodShowAll(request, response) {
  response.setHeader("Content-Type", "application/json");
  response.writeHead(200);
  response.end(JSON.stringify(myData));
}

function postMethod(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", () => {
    try {
      const bodyTodos = JSON.parse(body);

      if (!bodyTodos.title) {
        throw new Error("You must insert TITLE");
      }

      if (!bodyTodos.description) {
        throw new Error("You must insert DESCRIPTION");
      }

      if (!bodyTodos.dueDate) {
        bodyTodos.dueDate = "unknown";
      }

      if (!bodyTodos.isComplete) {
        bodyTodos.isComplete = false;
      }

      const newTodo = {
        id: myData.length,
        title: bodyTodos.title,
        description: bodyTodos.description,
        dueData: bodyTodos.dueDate,
        isComplete: bodyTodos.isComplete,
      };

      myData.push(newTodo);
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(myData.slice(-1)));
    } catch (err) {
      response.end(`ATTENTION => ${err.message}`);
    }
  });
}

function deleteMethod(idTodos, request, response) {
  const findIndexMyId = myData.findIndex((item) => item.id === +idTodos);
  if (findIndexMyId === -1) {
    throw new Error(`ID number ${idTodos} does not exists `);
  } else {
    myData.splice(findIndexMyId, 1);
    response.end(`Choosed ID ${idTodos} was removed`);
  }
}

function patchMethod(idTodos, request, response) {
  const findIndexMyId = myData.findIndex((item) => item.id === +idTodos);

  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", () => {
    try {
      const myIdObject = JSON.parse(body);
      const bodyTodos = myData[findIndexMyId];

      const newTodo = {
        title: bodyTodos.title,
        description: bodyTodos.description,
      };

      if (myIdObject.title) {
        newTodo["title"] = myIdObject.title;
      }
      if (myIdObject.description) {
        newTodo["description"] = myIdObject.description;
      }

      myData[findIndexMyId] = { ...myData[findIndexMyId], ...newTodo };
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(myData[findIndexMyId]));
    } catch (err) {
      response.end(`Don't send correct data => ${err}`);
    }
  });
}

server.on("request", (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const idTodos = parsedUrl.query["id"];

  try {
    if (parsedUrl.pathname === "/todos" && request.method === "GET") {
      if (idTodos === "") {
        throw new Error("Insert a value to ID");
      } else if (idTodos && !isNaN(+idTodos)) {
        getMethodOnlyId(idTodos, request, response);
      } else {
        getMethodShowAll(request, response);
      }
    }

    if (parsedUrl.pathname === "/todos" && request.method === "POST") {
      postMethod(request, response);
    }

    if (parsedUrl.pathname === "/todos" && request.method === "DELETE") {
      deleteMethod(idTodos, request, response);
    }

    if (parsedUrl.pathname === "/todos" && request.method === "PATCH") {
      patchMethod(idTodos, request, response);
    }
  } catch (err) {
    response.end(`Attention, you have an error => ${err.message}`);
  }
});

server.listen(accesServer.port, accesServer.host, () => {
  console.log(
    `Server is running on http://${accesServer.host}:${accesServer.port}`
  );
});
