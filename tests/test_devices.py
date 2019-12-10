from http import HTTPStatus
from io import BytesIO

from .utils import get_mocked_remote_devices_client

DEVICES_URL = '/remote-devices/api/devices'
DEVICE_URL = f'{DEVICES_URL}/1234'


def test_get_devices(app):
    backend_response = {'subordinates': []}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.get(DEVICES_URL)
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['subordinates']


def test_post_devices(app):
    backend_response = { 'result': True }
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.post(
            DEVICES_URL,
            data={"token": (BytesIO(b'foo=bar'), 'token.tar.gz')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.CREATED
    assert response.json == backend_response


def test_post_devices_backend_error(app):
    backend_response = { 'result': False }
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.post(
            DEVICES_URL,
            data={"token": (BytesIO(b'foo=bar'), 'token.tar.gz')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot add remote device token. Check if device is already added.'


def test_post_devices_missing_file(app):
    with get_mocked_remote_devices_client(app, {}) as client:
        response = client.post(
            DEVICES_URL,
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Missing data for \'token\' file.'


def test_delete_client_settings(app):
    with get_mocked_remote_devices_client(app, {'result': True}) as client:
        response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_delete_client_settings_backend_error(app):
    with get_mocked_remote_devices_client(app, {}) as client:
        response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete device.'


def test_delete_client_settings_unexpected_result(app):
    with get_mocked_remote_devices_client(app, {'result': 1234}) as client:
        response = client.delete(DEVICE_URL)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete device.'
