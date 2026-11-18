import { Component } from "react";
import ErrorView from "./ErrorView.jsx";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Cineloom encountered a rendering error:", error, errorInfo);
    this.moveToErrorRoute();
  }

  handleWindowError = (event) => {
    if (!event.error) return;
    this.reportError(event.error);
  };

  handleUnhandledRejection = (event) => {
    this.reportError(event.reason);
  };

  reportError(error) {
    console.error("Cineloom encountered an unexpected error:", error);
    this.moveToErrorRoute();
    this.setState({ hasError: true });
  }

  moveToErrorRoute() {
    if (window.location.pathname !== "/error") {
      window.history.pushState({ error: true }, "", "/error");
    }
  }

  render() {
    if (this.state.hasError) return <ErrorView />;
    return this.props.children;
  }
}
