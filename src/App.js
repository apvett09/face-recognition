import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import ParticlesBg from "particles-bg";
import { Component } from "react";

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

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  calculateFaceLocations = (data) => {
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

  displayFaceBox = (boxes) => {
    this.setState({ boxes: boxes });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({
      imageURL: this.state.input,
      boxes: [],
      errorMessage: "",
      numOfFaces: 0,
    });

    fetch("https://vert-fromage-72945-b3ad89284d69.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
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
          this.setState({ numOfFaces: 0 });
        }
        // results returned from api one or more faces detected
        if (parsedResult && parsedResult.outputs[0].data.regions) {
          const numOfFaces = parsedResult.outputs[0].data.regions.length;
          this.setState({ numOfFaces: numOfFaces });

          fetch("https://vert-fromage-72945-b3ad89284d69.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch((err) => console.log(err));

          this.displayFaceBox(this.calculateFaceLocations(parsedResult));
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ errorMessage: error.message }); // Update the error state
      });
  };

  onRouteChange = (route) => {
    if (route === "signout" || route === "signin") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageURL, route, boxes, errorMessage, numOfFaces } =
      this.state;
    return (
      <div className="App">
        <ParticlesBg color="#FFFFFF" num={200} type="cobweb" bg={true} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            {numOfFaces > 0 && (
              <p className="numOfFaces">
                Number of Faces Detected: {numOfFaces}
              </p>
            )}
            <FaceRecognition boxes={boxes} imageURL={imageURL} />
          </div>
        ) : route === "signin" ? (
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
