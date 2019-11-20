from http import HTTPStatus

from .utils import get_mocked_remote_devices_client


def test_get_example(app):
    backend_response = {'key': 'value'}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.get('/remote-devices/api/example')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response


def test_post_example_invalid_json(app):
    backend_response = {'result': True}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.post('/remote-devices/api/example')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_post_example_backend_error(app):
    backend_response = {'key': 'value'}
    with get_mocked_remote_devices_client(app, backend_response) as client:
        response = client.post('/remote-devices/api/example', json={'modules': []})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot create entity'
