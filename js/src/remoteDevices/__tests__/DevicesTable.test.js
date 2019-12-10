/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, fireEvent } from "foris/testUtils/customTestRender";

import DevicesTable from "../DevicesTable";
import devicesFixture from "./__fixtures__/devices";

describe("<DevicesTable />", () => {
    const onDelete = jest.fn();

    function renderTable(devices, isDeleting = false) {
        return render(
            <DevicesTable devices={devices} isDeleting={isDeleting} onDelete={onDelete} />,
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

    it("should execute onDelete callback when button is pressed", () => {
        const { getAllByText } = renderTable(devicesFixture);
        const deleteButtons = getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
        expect(onDelete).toBeCalledWith({ suffix: devicesFixture[0].controller_id });
    });
});
