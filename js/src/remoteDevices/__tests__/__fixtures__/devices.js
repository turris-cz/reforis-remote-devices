/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

const devices = [
    { controller_id: "A1", enabled: true, options: { custom_name: "A" } },
    { controller_id: "A2", enabled: false, options: { custom_name: "A" } },
    { controller_id: "B1", enabled: true, options: { custom_name: "B" } },
    { controller_id: "B2", enabled: false, options: { custom_name: "B" } },
];

export function createDevice(controller_id, enabled, custom_name) {
    return { controller_id, enabled, options: { custom_name } };
}

export default devices;
