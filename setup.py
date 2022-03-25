#  Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

# !/usr/bin/env python3

import copy
import pathlib

import setuptools
from setuptools.command.build_py import build_py

NAME = 'reforis_remote_devices'

BASE_DIR = pathlib.Path(__file__).absolute().parent


class RemoteDevicesBuild(build_py):
    def run(self):
        # build package
        build_py.run(self)

        from reforis_distutils import ForisPluginBuild
        cmd = ForisPluginBuild(copy.copy(self.distribution))
        cmd.root_path = BASE_DIR
        cmd.module_name = NAME
        cmd.build_lib = self.build_lib
        cmd.ensure_finalized()
        cmd.run()


setuptools.setup(
    name=NAME,
    version='1.4.1',
    packages=setuptools.find_packages(exclude=['tests']),
    include_package_data=True,

    description='reForis Remote Devices plugin allows detecting new devices on a local network.',
    url='https://gitlab.nic.cz/turris/reforis/reforis-remote-devices',
    author='CZ.NIC, z.s.p.o. (https://www.nic.cz/)',
    author_email='software@turris.com',

    install_requires=[
        'flask',
        'Babel',
        'Flask-Babel',
        'reforis @ git+https://gitlab.nic.cz/turris/reforis/reforis#egg=reforis',
    ],
    extras_require={
        'devel': [
            'pytest',
            'pylint',
            'pylint-quotes',
            'pycodestyle',
        ],
    },
    setup_requires=[
        'reforis_distutils',
    ],
    dependency_links=[
        'git+https://gitlab.nic.cz/turris/reforis/reforis-distutils.git#egg=reforis-distutils',
    ],
    entry_points={
        'foris.plugins': f'{NAME} = {NAME}:remote_devices'
    },
    classifiers=[
        'Framework :: Flask',
        'Intended Audience :: Developers',
        'Development Status :: 3 - Alpha',
        'License :: Other/Proprietary License',
        'Natural Language :: English',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Application',
    ],
    cmdclass={
        'build_py': RemoteDevicesBuild,
    },
    zip_safe=False,
)
