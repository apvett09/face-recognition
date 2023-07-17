import React, { useState, useEffect } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import ParticlesBg from "particles-bg";

const initialState = {
  input: "",
  imageURL: "",
  errorMessage: "",
  numOfFaces: 0,
  boxes: [],
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
};

const App = () => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Initialize state
    setState(initialState);
  }, []);

  const loadUser = (data) => {
    setState((prevState) => ({
      ...prevState,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    }));
  };

  const calculateFaceLocations = (data) => {
    const clarifaiFaces = data.outputs[0].data.regions;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return clarifaiFaces.map((clarifaiFace) => {
      const faceCoordinates = clarifaiFace.region_info.bounding_box;

      return {
        leftCol: faceCoordinates.left_col * width,
        topRow: faceCoordinates.top_row * height,
        rightCol: width - faceCoordinates.right_col * width,
        bottomRow: height - faceCoordinates.bottom_row * height,
      };
    });
  };

  const displayFaceBox = (boxes) => {
    setState((prevState) => ({
      ...prevState,
      boxes: boxes,
    }));
  };

  const onInputChange = (event) => {
    setState((prevState) => ({
      ...prevState,
      input: event.target.value,
    }));
  };

  const onButtonSubmit = () => {
    setState((prevState) => ({
      ...prevState,
      imageURL: prevState.input,
      boxes: [],
      errorMessage: "",
      numOfFaces: 0,
    }));

    fetch("https://vert-fromage-72945-b3ad89284d69.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: prevState.input,
      }),
    })
      .then((response) => {
        if (response.status === 500) {
          throw new Error(
            "Whoops! Sorry, we are currently unable to connect to the API."
          );
        }
        return response.json();
      })
      .then((result) => {
        const parsedResult = JSON.parse(result);
        // we have results from the api but the image url is invalid (NOT jpg, png, etc)
        if (parsedResult && parsedResult.status.description === "Failure") {
          // Set the error message in state
          throw new Error("Invalid image URL to detect.");
        }

        // results returned from api but no faces detected
        if (
          parsedResult &&
          Object.keys(parsedResult.outputs[0].data).length === 0
        ) {
          setState((prevState) => ({
            ...prevState,
            numOfFaces: 0,
          }));
        }
        // results returned from api one or more faces detected
        if (parsedResult && parsedResult.outputs[0].data.regions) {
          const numOfFaces = parsedResult.outputs[0].data.regions.length;
          setState((prevState) => ({
            ...prevState,
            numOfFaces: numOfFaces,
          }));

          fetch("https://vert-fromage-72945-b3ad89284d69.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: prevState.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              setState((prevState) => ({
                ...prevState,
                user: { ...prevState.user, entries: count },
              }));
            })
            .catch((err) => console.log(err));

          displayFaceBox(calculateFaceLocations(parsedResult));
        }
      })
      .catch((error) => {
        console.log(error);
        setState((prevState) => ({
          ...prevState,
          errorMessage: error.message,
        }));
      });
  };

  const onRouteChange = (route) => {
    if (route === "signout" || route === "signin") {
      setState(initialState);
    } else if (route === "home") {
      setState((prevState) => ({
        ...prevState,
        isSignedIn: true,
      }));
    }
    setState((prevState) => ({
      ...prevState,
      route: route,
    }));
  };

  const { isSignedIn, imageURL, route, boxes, errorMessage, numOfFaces } =
    state;

  return (
    <div className="App">
      <ParticlesBg color="#FFFFFF" num={200} type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank name={state.user.name} entries={state.user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          {errorMessage && <p className="errorMessage">{errorMessage}</p>}
          {numOfFaces > 0 && (
            <p className="numOfFaces">Number of Faces Detected: {numOfFaces}</p>
          )}
          <FaceRecognition boxes={boxes} imageURL={imageURL} />
        </div>
      ) : route === "signin" ? (
        <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />
      ) : (
        <Register loadUser={loadUser} onRouteChange={onRouteChange} />
      )}
    </div>
  );
};

export default App;
