/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import mockAxios from "jest-mock-axios";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import {
    render,
    fireEvent,
    getByLabelText,
    getByText,
    wait,
} from "foris/testUtils/customTestRender";

import AddDeviceForm from "../AddDeviceForm";

function getFormElements(container) {
    return {
        fileInput: getByLabelText(container, "Choose token file"),
        submitButton: getByText(container, "Upload token"),
    };
}

function setFilesProperty(input, files) {
    // Files can't be set by fireEvent, see https://github.com/testing-library/react-testing-library/issues/93
    Object.defineProperty(input, "files", { value: files, configurable: true });
}

describe("<AddDeviceForm />", () => {
    let container;
    let fileInput;
    let submitButton;
    const emptyFile = new File([], "token.tar.gz");

    beforeEach(() => {
        ({ container } = render(<AddDeviceForm />));
        ({ fileInput, submitButton } = getFormElements(container));
    });

    it("should render form", () => {
        expect(container).toMatchSnapshot();
    });

    it("should add device", () => {
        expect(submitButton.disabled).toBe(true);
        setFilesProperty(fileInput, [emptyFile]);
        fireEvent.change(fileInput);
        expect(submitButton.disabled).toBe(false);

        fireEvent.click(submitButton);
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/remote-devices/api/devices",
            expect.anything(), // Can't compare two FormData objects
            expect.anything()
        );
    });

    it("should validate form", () => {
        // Wrong length of file name
        setFilesProperty(fileInput, [new File([], "q".repeat(51))]);
        fireEvent.change(fileInput);
        expect(
            getByText(
                container,
                "The filename must be at least 1 and at most 50 characters long."
            )
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // Invalid characters
        setFilesProperty(fileInput, [new File([], "!@#!$@%.tar.gz")]);
        fireEvent.change(fileInput);
        expect(
            getByText(
                container,
                "The filename can contain only alphanumeric characters, dots, dashes, and underscores."
            )
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // File too big
        setFilesProperty(fileInput, [
            new File(["q".repeat(1024 * 1025)], "turris.tar.gz"),
        ]);
        fireEvent.change(fileInput);
        expect(
            getByText(
                container,
                "The file is too big. The maximum size is 1 MB."
            )
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);
    });

    it("should handle API error", async () => {
        setFilesProperty(fileInput, [emptyFile]);
        fireEvent.change(fileInput);
        fireEvent.click(submitButton);

        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
    });
});
