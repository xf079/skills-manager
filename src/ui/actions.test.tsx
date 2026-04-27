import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("capability actions", () => {
  it("shows confirmation for delete to trash", async () => {
    render(<App />);

    expect(await screen.findAllByText("review")).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Move capability to app trash?")).toBeInTheDocument();
    expect(screen.getByText("This does not permanently delete files.")).toBeInTheDocument();
  });
});
