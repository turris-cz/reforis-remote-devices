#  Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

"""reForis Remote Devices plugin"""

from pathlib import Path
from http import HTTPStatus
import base64

from flask import Blueprint, current_app, jsonify, request
from flask_babel import gettext as _

from reforis.foris_controller_api.utils import validate_json, APIError

blueprint = Blueprint(
    "RemoteDevices",
    __name__,
    url_prefix="/remote-devices/api",
)

BASE_DIR = Path(__file__).parent

remote_devices = {
    "blueprint": blueprint,
    "js_app_path": "reforis_remote_devices/js/app.min.js",
    "translations_path": BASE_DIR / "translations",
}


@blueprint.route("/devices", methods=["GET"])
def get_devices():
    """Get list of devices"""
    return jsonify(current_app.backend.perform("subordinates", "list")["subordinates"])


@blueprint.route("/devices", methods=["POST"])
def post_devices():
    """Add new device"""
    if "token" not in request.files:
        raise APIError(_("Missing data for 'token' file."), HTTPStatus.BAD_REQUEST)
    token_file = request.files["token"]

    response = current_app.backend.perform(
        "subordinates",
        "add_sub",
        {"token": base64.b64encode(token_file.read()).decode("utf-8")},
    )
    if response.get("result") is not True:
        raise APIError(
            _("Cannot add remote device token. Check if device is already added."),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    return jsonify(response), HTTPStatus.CREATED


@blueprint.route("/devices/<controller_id>", methods=["DELETE"])
def delete_client(controller_id):
    """Delete device"""
    response = current_app.backend.perform("subordinates", "del", {"controller_id": controller_id})
    if response.get("result") is not True:
        raise APIError(_("Cannot delete device."), HTTPStatus.INTERNAL_SERVER_ERROR)
    return "", HTTPStatus.NO_CONTENT


@blueprint.route("/devices/<controller_id>", methods=["PATCH"])
def patch_devices(controller_id):
    """
    Change device options and its enabled state (either must be provided).
    """
    validate_json(request.json)

    options = request.json.get("options")
    enabled = request.json.get("enabled")

    if not options and enabled is None:
        raise APIError(_('Missing data for "options" or "enabled" field.'), HTTPStatus.BAD_REQUEST)

    responses = []
    if options:
        custom_name = options.get("custom_name")
        if custom_name and len(custom_name) > 30:
            raise APIError(_("Name is too long. Maximum 30 characters are allowed."), HTTPStatus.BAD_REQUEST)

        options_response = current_app.backend.perform(
            "subordinates",
            "update_sub",
            {"controller_id": controller_id, "options": options},
        )
        responses.append(options_response)
    if enabled is not None:  # because "enabled" is boolean
        enabled_response = current_app.backend.perform(
            "subordinates",
            "set_enabled",
            {"controller_id": controller_id, "enabled": enabled},
        )
        responses.append(enabled_response)

    update_failed = any(response.get("result") is not True for response in responses)

    if update_failed:
        raise APIError(_("Cannot update device."), HTTPStatus.INTERNAL_SERVER_ERROR)

    return "", HTTPStatus.NO_CONTENT
