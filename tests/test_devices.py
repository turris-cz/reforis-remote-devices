from http import HTTPStatus
from io import BytesIO

import pytest

from .utils import get_mocked_remote_devices_client

DEVICES_URL = '/remote-devices/api/devices'
DEVICE_URL = f'{DEVICES_URL}/1234'


def test_get_devices(app):
    backend_response = {'subordinates': []}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.get(DEVICES_URL)
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['subordinates']


def test_post_device(app):
    backend_response = {'result': True}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.post(
            DEVICES_URL,
            data={"token": (BytesIO(b'foo=bar'), 'token.tar.gz')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.CREATED
    assert response.json == backend_response


def test_post_device_backend_error(app):
    backend_response = {'result': False}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.post(
            DEVICES_URL,
            data={"token": (BytesIO(b'foo=bar'), 'token.tar.gz')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot add remote device token. Check if device is already added.'


def test_post_device_missing_file(app):
    with get_mocked_remote_devices_client(app, {}) as client:
        response = client.post(
            DEVICES_URL,
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Missing data for \'token\' file.'


def test_delete_device(app):
    with get_mocked_remote_devices_client(app, {'result': True}) as client:
        response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_delete_device_backend_error(app):
    with get_mocked_remote_devices_client(app, {}) as client:
        response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete device.'


def test_delete_device_unexpected_result(app):
    with get_mocked_remote_devices_client(app, {'result': 1234}) as client:
        response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete device.'


def test_patch_device(app):
    backend_response = {
        'subordinates': {
            'set_enabled': {'result': True},
            'update_sub': {'result': True}
        }
    }
    with get_mocked_remote_devices_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.patch(DEVICE_URL, json={'enabled': False, 'options': {'custom_name': 'foobar'}})
    assert response.status_code == HTTPStatus.NO_CONTENT


@pytest.mark.parametrize(
    'request_data',
    [{'enabled': True}, {'options': {'custom_name': 'foobar'}}]
)
def test_patch_device_partially(app, request_data):
    with get_mocked_remote_devices_client(app, {'result': True}) as client:
        response = client.patch(DEVICE_URL, json=request_data)
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_patch_device_invalid_json(app):
    with get_mocked_remote_devices_client(app, {}) as client:
        response = client.patch(DEVICE_URL)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_patch_device_name_too_long(app):
    with get_mocked_remote_devices_client(app, {}) as client:
        response = client.patch(DEVICE_URL, json={'options': {'custom_name': 'Q'*31}})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Name is too long. Maximum 30 characters are allowed.'


@pytest.mark.parametrize(
    'backend_response',
    [
        {'subordinates': {'set_enabled': {'result': True}, 'update_sub': {'result': False}}},
        {'subordinates': {'set_enabled': {'result': False}, 'update_sub': {'result': True}}}
    ]
)
def test_patch_device_backend_error(app, backend_response):
    with get_mocked_remote_devices_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.patch(DEVICE_URL, json={'enabled': False, 'options': {'custom_name': 'foobar'}})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot update device.'
