/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, fireEvent, act } from "foris/testUtils/customTestRender";
import { WebSockets } from "foris";

import DevicesTable from "../DevicesTable";
import devicesFixture from "./__fixtures__/devices";

describe("<DevicesTable />", () => {
    const deleteDevice = jest.fn();
    const patchDevice = jest.fn();
    let webSockets;

    function renderTable(devices, isDeleting = false) {
        webSockets = new WebSockets();
        return render(
            <DevicesTable
                ws={webSockets}
                devices={devices}
                isDeleting={isDeleting}
                deleteDevice={deleteDevice}
                patchDevice={patchDevice}
            />,
        );
    }

    it("should handle empty devices list", () => {
        const { container } = renderTable([]);
        expect(container).toMatchSnapshot();
    });

    it("should render devices table", () => {
        const { container } = renderTable(devicesFixture);
        expect(container).toMatchSnapshot();
    });

    it("should execute deleteDevice callback when delete button is pressed", () => {
        const { getAllByText } = renderTable(devicesFixture);
        const deleteButtons = getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
        expect(deleteDevice).toBeCalledWith({ suffix: devicesFixture[0].controller_id });
    });

    it("should execute patchDevice callback when name is changed", () => {
        const device = devicesFixture[0];
        const { getByDisplayValue, getByTitle, queryByTitle } = renderTable([device]);
        const nameInput = getByDisplayValue(device.options.custom_name);
        const newName = "First device name";

        // Input is disabled and buttons are hidden before editor is enabled
        expect(nameInput.readOnly).toBe(true);
        expect(queryByTitle("Save changes")).toBeNull();

        fireEvent.click(getByTitle("Edit name"));
        expect(nameInput.readOnly).toBe(false);

        fireEvent.change(nameInput, { target: { value: newName } });

        fireEvent.click(getByTitle("Save changes"));
        expect(patchDevice).toBeCalledWith({ data: { options: { custom_name: newName } }, suffix: device.controller_id });
        expect(nameInput.readOnly).toBe(true);
    });

    it("should reset name when changes are discarded with button", () => {
        const device = devicesFixture[0];
        const { getByDisplayValue, getByTitle } = renderTable([device]);
        const nameInput = getByDisplayValue(device.options.custom_name);
        const newName = "First device name";

        fireEvent.click(getByTitle("Edit name"));
        fireEvent.change(nameInput, { target: { value: newName } });
        expect(nameInput.value).toBe(newName);

        fireEvent.click(getByTitle("Discard changes"));
        expect(nameInput.value).toBe(device.options.custom_name);
        expect(patchDevice).not.toBeCalled();
        expect(nameInput.readOnly).toBe(true);
    });

    it("should execute patchDevice callback when toggle is pressed (disable)", () => {
        const { getAllByText } = renderTable(devicesFixture);
        const toggleButtons = getAllByText("Yes");
        fireEvent.click(toggleButtons[0]);
        expect(patchDevice).toBeCalledWith({ data: { "enabled": false }, suffix: devicesFixture[0].controller_id });
    });

    it("should execute patchDevice callback when toggle is pressed (enable) ", () => {
        const { getAllByText } = renderTable(devicesFixture);
        const toggleButtons = getAllByText("No");
        fireEvent.click(toggleButtons[0]);
        expect(patchDevice).toBeCalledWith({ data: { "enabled": true }, suffix: devicesFixture[1].controller_id });
    });

    it("should display started status", () => {
        const device = devicesFixture[0];
        const { getByTitle } = renderTable([device]);
        act(() => webSockets.dispatch(
            { module: "remote", action: "advertize", data: { id: device.controller_id, state: "started" } },
        ));
        expect(getByTitle("Started")).toBeDefined();
    });

    it("should display running status", () => {
        const device = devicesFixture[0];
        const { getByTitle } = renderTable([device]);
        act(() => webSockets.dispatch(
            { module: "remote", action: "advertize", data: { id: device.controller_id, state: "running" } },
        ));
        expect(getByTitle("Running")).toBeDefined();
    });

    it("should display exited status", () => {
        const device = devicesFixture[0];
        const { getByTitle } = renderTable([device]);
        act(() => webSockets.dispatch(
            { module: "remote", action: "advertize", data: { id: device.controller_id, state: "exitted" } },
        ));
        expect(getByTitle("Exited")).toBeDefined();
    });
});
