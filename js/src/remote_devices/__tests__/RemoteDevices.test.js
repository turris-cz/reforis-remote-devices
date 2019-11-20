/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import mockAxios from "jest-mock-axios";
import { render } from "foris/testUtils/customTestRender";

import RemoteDevices from "../RemoteDevices";

describe("<RemoteDevices />", () => {
    it("should render component", () => {
        const { getByText } = render(<RemoteDevices />);
        expect(getByText("Remote Devices")).toBeDefined();
        expect(mockAxios.get).toBeCalledWith("reforis/remote-devices/api/example", expect.anything());
    });
});
