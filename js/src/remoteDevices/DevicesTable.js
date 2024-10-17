/*
 * Copyright (C) 2019-2023 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useState } from "react";

import {
    faTrash,
    faQuestionCircle,
    faPlayCircle,
    faCheckCircle,
    faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, useWSForisModule, CheckBox } from "foris";
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
            <p className="text-muted text-center mb-0">
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
                            className="text-end"
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
            <td className="text-end">
                <Button className="btn-sm btn-danger" onClick={deleteDevice}>
                    <span className="d-xl-none">
                        <FontAwesomeIcon icon={faTrash} className="fa-sm" />
                    </span>
                    <span className="d-none d-xl-block">
                        <FontAwesomeIcon
                            icon={faTrash}
                            className="fa-sm me-1"
                        />
                        {_("Delete")}
                    </span>
                </Button>
            </td>
        </tr>
    );
}

StatusIcon.propTypes = {
    status: PropTypes.string,
};

const statusMap = {
    started: {
        icon: faPlayCircle,
        className: "text-primary",
        description: _("Started"),
    },
    running: {
        icon: faCheckCircle,
        className: "text-success",
        description: _("Running"),
    },
    exited: {
        icon: faTimesCircle,
        className: "text-danger",
        description: _("Exited"),
    },
    default: {
        icon: faQuestionCircle,
        className: "text-warning",
        description: _("Unknown status"),
    },
};

function StatusIcon({ status }) {
    const { icon, className, description } =
        statusMap[status] || statusMap.default;

    return (
        <FontAwesomeIcon
            icon={icon}
            className={`fa-lg ${className}`}
            title={description}
        />
    );
}
