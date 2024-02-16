#  Copyright (C) 2020 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus
from io import BytesIO

import pytest

from reforis.test_utils import mock_backend_response

DEVICES_URL = '/remote-devices/api/devices'
DEVICE_URL = f'{DEVICES_URL}/1234'


@mock_backend_response({'subordinates': {'list': {'subordinates': []}}})
def test_get_devices(client):
    backend_response = {'subordinates': []}
    response = client.get(DEVICES_URL)
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['subordinates']


@mock_backend_response({'subordinates': {'add_sub': {'result': True}}})
def test_post_device(client):
    response = client.post(
        DEVICES_URL,
        data={"token": (BytesIO(b'foo=bar'), 'token.tar.gz')},
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.CREATED
    assert response.json == {'result': True}


@mock_backend_response({'subordinates': {'add_sub': {'result': False}}})
def test_post_device_backend_error(client):
    response = client.post(
        DEVICES_URL,
        data={"token": (BytesIO(b'foo=bar'), 'token.tar.gz')},
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot add remote device token. Check if device is already added.'


@mock_backend_response({'subordinates': {'add_sub': {}}})
def test_post_device_missing_file(client):
    response = client.post(
        DEVICES_URL,
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Missing data for \'token\' file.'


@mock_backend_response({'subordinates': {'del': {'result': True}}})
def test_delete_device(client):
    response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.NO_CONTENT


@mock_backend_response({'subordinates': {'del': {}}})
def test_delete_device_backend_error(client):
    response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete device.'


@mock_backend_response({'subordinates': {'del': {'result': 1234}}})
def test_delete_device_unexpected_result(client):
    response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete device.'


@mock_backend_response({
    'subordinates': {
        'set_enabled': {'result': True},
        'update_sub': {'result': True}
    }
})
def test_patch_device(client):
    response = client.patch(DEVICE_URL, json={'enabled': False, 'options': {'custom_name': 'foobar'}})
    assert response.status_code == HTTPStatus.NO_CONTENT


@pytest.mark.parametrize(
    'request_data',
    [
        {'enabled': True},
        {'options': {'custom_name': 'foobar'}}
    ]
)
@mock_backend_response({
    'subordinates': {
        'set_enabled': {'result': True},
        'update_sub': {'result': True}
    }
})
def test_patch_device_partially(client, request_data):
    response = client.patch(DEVICE_URL, json=request_data)
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_patch_device_invalid_json(client):
    response = client.patch(DEVICE_URL, json={})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_patch_device_name_too_long(client):
    response = client.patch(DEVICE_URL, json={'options': {'custom_name': 'Q' * 31}})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Name is too long. Maximum 30 characters are allowed.'


@pytest.mark.parametrize(
    'backend_response',
    [
        {'subordinates': {'set_enabled': {'result': True}, 'update_sub': {'result': False}}},
        {'subordinates': {'set_enabled': {'result': False}, 'update_sub': {'result': True}}}
    ]
)
def test_patch_device_backend_error(client, backend_response):
    with mock_backend_response(backend_response):
        response = client.patch(DEVICE_URL, json={'enabled': False, 'options': {'custom_name': 'foobar'}})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot update device.'
