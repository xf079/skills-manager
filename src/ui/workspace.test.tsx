import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("workspace behavior", () => {
  it("starts global-only and reveals workspace scope after selection", async () => {
    render(<App />);

    expect(await screen.findByText("No workspace selected")).toBeInTheDocument();
    expect(screen.queryByText("Workspace scope")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Choose" }));

    expect(await screen.findByText("D:/example/workspace")).toBeInTheDocument();
    expect(screen.getByText("Workspace scope")).toBeInTheDocument();
  });
});
