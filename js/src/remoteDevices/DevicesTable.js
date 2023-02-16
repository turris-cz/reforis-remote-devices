/*
 * Copyright (C) 2019-2023 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useState } from "react";

import { Button, useWSForisModule } from "foris";
import PropTypes from "prop-types";

import EditableName from "./editableName/EditableName";
import ToggleDevice from "./ToggleDevice";

import "./DevicesTable.css";

const deviceShape = PropTypes.shape({
    controller_id: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    options: PropTypes.shape({
        custom_name: PropTypes.string,
    }),
});

DevicesTable.propTypes = {
    ws: PropTypes.object.isRequired,
    devices: PropTypes.arrayOf(deviceShape).isRequired,
    deleteDevice: PropTypes.func.isRequired,
    patchDevice: PropTypes.func.isRequired,
};

function DevicesTable({ ws, devices, deleteDevice, patchDevice }) {
    if (!devices || devices.length === 0) {
        return (
            <p className="text-muted text-center">
                {_("No devices added yet.")}
            </p>
        );
    }

    return (
        // Bottom padding is required to prevent unnecessary vertical scroll when editor is active
        <div className="table-responsive pb-2">
            <table className="table table-hover devices-table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">{_("ID")}</th>
                        <th scope="col">{_("Name")}</th>
                        <th scope="col" className="text-center">
                            {_("Status")}
                        </th>
                        <th scope="col" className="text-center">
                            {_("Managed")}
                        </th>
                        <th
                            scope="col"
                            className="text-right"
                            aria-label={_("Delete")}
                        />
                    </tr>
                </thead>
                <tbody>
                    {devices.map((device) => (
                        <DeviceRow
                            key={device.controller_id}
                            ws={ws}
                            device={device}
                            deleteDevice={() => {
                                deleteDevice({ suffix: device.controller_id });
                            }}
                            patchDevice={(data) => {
                                patchDevice({
                                    data,
                                    suffix: device.controller_id,
                                });
                            }}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DevicesTable;

DeviceRow.propTypes = {
    ws: PropTypes.object.isRequired,
    device: deviceShape,
    deleteDevice: PropTypes.func.isRequired,
    patchDevice: PropTypes.func.isRequired,
};

function DeviceRow({ ws, device, deleteDevice, patchDevice }) {
    const [status, setStatus] = useState();

    const [advertizeNotification] = useWSForisModule(ws, "remote", "advertize");
    useEffect(() => {
        if (
            advertizeNotification &&
            advertizeNotification.id === device.controller_id
        ) {
            setStatus(advertizeNotification.state);
        }
    }, [advertizeNotification, device.controller_id, status]);

    return (
        <tr>
            <td>{device.controller_id}</td>
            <td className="editable-name">
                <EditableName
                    name={device.options.custom_name}
                    patchDevice={patchDevice}
                />
            </td>
            <td className="text-center">
                {/* "key" is necessary to update the icon, see https://stackoverflow.com/q/47722813/6324591 */}
                <StatusIcon
                    status={status}
                    key={`${device.controller_id}-${status}`}
                />
            </td>
            <td className="text-center">
                <ToggleDevice
                    controllerID={device.controller_id}
                    enabled={device.enabled}
                    patchDevice={patchDevice}
                />
            </td>
            <td className="text-right">
                <Button className="btn-sm btn-danger" onClick={deleteDevice}>
                    <i className="fa fa-trash-alt mr-2 devices-table-delete-icon" />
                    {_("Delete")}
                </Button>
            </td>
        </tr>
    );
}

StatusIcon.propTypes = {
    status: PropTypes.string,
};

function StatusIcon({ status }) {
    let className = "fa-question-circle text-warning";
    let statusDescription = _("Unknown status");
    if (status === "started") {
        className = "fa-play-circle text-primary";
        statusDescription = _("Started");
    } else if (status === "running") {
        className = "fa-check-circle text-success";
        statusDescription = _("Running");
    } else if (status === "exitted") {
        className = "fa-times-circle text-danger";
        statusDescription = _("Exited");
    }

    /*
     * Wrapper tag is required to properly remove icon because "i" element
     * is actually replaced by "svg" element.
     */
    return (
        <span>
            <i className={`fa fa-lg ${className}`} title={statusDescription} />
        </span>
    );
}
