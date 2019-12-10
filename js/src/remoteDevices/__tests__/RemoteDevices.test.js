/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import mockAxios from "jest-mock-axios";
import { render, waitForElement, getByText } from "foris/testUtils/customTestRender";
import { WebSockets } from "foris";

import RemoteDevices from "../RemoteDevices";

describe("<RemoteDevices />", () => {
    it("should render component", async () => {
        const webSockets = new WebSockets();
        const { container } = render(<RemoteDevices ws={webSockets} />);
        expect(mockAxios.get).toBeCalledWith("/reforis/remote-devices/api/devices", expect.anything());
        mockAxios.mockResponse({ data: [] });
        await waitForElement(() => getByText(container, "No devices added yet."));
        expect(container).toMatchSnapshot();
    });
});
