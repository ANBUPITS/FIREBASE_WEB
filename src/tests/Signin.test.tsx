import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Signin from "../screens/Signin";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

describe("Signin Component", () => {
  test("renders email and password inputs", () => {
    render(
      <BrowserRouter>
        <Signin />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("submit button is enabled when fields are filled", () => {
    render(
      <BrowserRouter>
        <Signin />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).not.toBeDisabled();
  });

  test("navigates to signup when link is clicked", () => {
    render(
      <BrowserRouter>
        <Signin />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/sign up/i));
    expect(window.location.pathname).toBe("/Signup");
  });
});
