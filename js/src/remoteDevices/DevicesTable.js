/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

import { withSpinnerOnSending, withErrorMessage, Button } from "foris";

const deviceShape = PropTypes.shape({
    controller_id: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
});

DevicesTable.propTypes = {
    devices: PropTypes.arrayOf(deviceShape).isRequired,
    onDelete: PropTypes.func.isRequired,
};

function DevicesTable({ devices, onDelete }) {
    if (!devices || devices.length === 0) {
        return <p className="text-muted text-center">{_("No devices added yet.")}</p>;
    }

    return (
        <table className="table table-hover">
            <thead>
                <tr>
                    <th scope="col">{_("ID")}</th>
                    <th scope="col">{_("Access")}</th>
                    <th scope="col" aria-label={_("Delete")} />
                </tr>
            </thead>
            <tbody>
                {devices.map(
                    (device) => (
                        <DeviceRow
                            key={device.controller_id}
                            device={device}
                            onDelete={() => onDelete({ suffix: device.controller_id })}
                        />
                    ),
                )}
            </tbody>
        </table>
    );
}

DeviceRow.propTypes = {
    device: deviceShape,
    onDelete: PropTypes.func.isRequired,
};

function DeviceRow({ device, onDelete }) {
    return (
        <tr>
            <td className="align-middle">{ device.controller_id }</td>
            <td className="align-middle">{ device.enabled ? "Enabled" : "Disabled" }</td>
            <td>
                <Button className="btn-sm btn-danger" onClick={onDelete}>
                    <i className="fa fa-trash-alt mr-2" />
                    {_("Delete")}
                </Button>
            </td>
        </tr>
    );
}

export default withSpinnerOnSending(withErrorMessage(DevicesTable));
