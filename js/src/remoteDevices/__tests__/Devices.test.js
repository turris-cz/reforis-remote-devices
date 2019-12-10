/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import mockAxios from "jest-mock-axios";
import {
    render, fireEvent, act, wait, waitForElement, getByText, getAllByText, getByRole, queryByRole,
    queryByText,
} from "foris/testUtils/customTestRender";
import { mockJSONError } from "foris/testUtils/network";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { WebSockets } from "foris";

import devices from "./__fixtures__/devices";
import Devices from "../Devices";

describe("<Devices />", () => {
    let container;
    let webSockets;

    beforeEach(() => {
        webSockets = new WebSockets();
        ({ container } = render(<Devices ws={webSockets} />));
    });

    it("should render spinner", () => {
        expect(container).toMatchSnapshot();
    });

    it("should render table", async () => {
        expect(mockAxios.get).toBeCalledWith(
            "/reforis/remote-devices/api/devices", expect.anything(),
        );
        mockAxios.mockResponse({ data: devices });
        await waitForElement(() => getByText(container, devices[0].controller_id));
        expect(container).toMatchSnapshot();

    });

    it("should handle GET error", async () => {
        mockJSONError();
        await wait(() => expect(
            getByText(container, "An error occurred while fetching data."),
        ).toBeTruthy());
    });

    it("should refresh table after new device is added", async () => {
        // Prepare table
        mockAxios.mockResponse({ data: devices });
        await wait(() => getByText(container, devices[0].controller_id));

        // Add new device
        const newID = "C1";
        act(() => webSockets.dispatch(
            { module: "subordinates", action: "add_sub", data: { controller_id: newID } },
        ));
        expect(mockAxios.get).toHaveBeenNthCalledWith(2, "/reforis/remote-devices/api/devices", expect.anything());
        mockAxios.mockResponse({ data: [...devices, { controller_id: newID, enabled: true }] });
        // New device should appear
        await wait(() => getByText(container, newID));
    });

    it("should display spinner while device is being added", async () => {
        // Prepare table
        mockAxios.mockResponse({ data: devices });
        // Initially there's no spinner
        await wait(() => expect(
            queryByRole(container, "status"),
        ).toBeNull());

        // Add new device
        const newID = "C1";
        act(() => webSockets.dispatch(
            { module: "subordinates", action: "add_sub", data: { controller_id: newID } },
        ));
        // Spinner should appear
        await wait(() => getByRole(container, "status"));
    });

    it("should refresh table after device is removed", async () => {
        // Prepare table
        mockAxios.mockResponse({ data: devices });
        const deletedID = devices[0].controller_id;
        await wait(() => getByText(container, deletedID));

        // Delete device
        fireEvent.click(getAllByText(container, "Delete")[0]);
        expect(mockAxios.delete).toBeCalledWith(
            "/reforis/remote-devices/api/devices/A1", expect.anything(),
        );
        mockAxios.mockResponse({ data: {} });

        act(() => webSockets.dispatch(
            { module: "subordinates", action: "del", data: { controller_id: deletedID } },
        ));
        // Device should disappear
        await wait(() => expect(queryByText(container, deletedID)).toBeNull());
    });

    it("should display spinner when device is being removed", async () => {
        // Prepare table
        mockAxios.mockResponse({ data: devices });
        // Initially there's no spinner
        await wait(() => expect(
            queryByRole(container, "status"),
        ).toBeNull());

        // Delete device
        fireEvent.click(getAllByText(container, "Delete")[0]);
        // Spinner should appear
        await wait(() => getByRole(container, "status"));
    });

    it("should handle error on removal", async () => {
        // Prepare table
        mockAxios.mockResponse({ data: devices });
        await wait(() => getByText(container, devices[0].controller_id));
        // Delete device
        fireEvent.click(getAllByText(container, "Delete")[0]);
        // Handle error
        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
    });
});
