#!/usr/bin/env python
# -*- coding: utf-8 -*-
from setuptools import find_packages, setup

from djangocms_text_ckeditor import __version__


REQUIREMENTS = [
    'django-cms',
    'html5lib>=1',
    'Pillow',
]


CLASSIFIERS = [
    'Development Status :: 5 - Production/Stable',
    'Environment :: Web Environment',
    'Intended Audience :: Developers',
    'License :: OSI Approved :: BSD License',
    'Operating System :: OS Independent',
    'Framework :: Django',
    'Framework :: Django :: 2.2',
    'Framework :: Django :: 3.0',
    'Framework :: Django :: 3.1',
    'Framework :: Django :: 3.2',
    'Programming Language :: Python',
    'Programming Language :: Python :: 3',
    'Programming Language :: Python :: 3.6',
    'Programming Language :: Python :: 3.7',
    'Programming Language :: Python :: 3.8',
    'Programming Language :: Python :: 3.9',
    'Topic :: Internet :: WWW/HTTP',
    'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    'Topic :: Software Development',
    'Topic :: Software Development :: Libraries',
]


setup(
    name='djangocms-text-ckeditor',
    version=__version__,
    author='Divio AG',
    author_email='info@divio.ch',
    url='https://github.com/divio/djangocms-text-ckeditor',
    license='BSD',
    description='Text Plugin for django CMS with CKEditor support',
    long_description=open('README.rst').read(),
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=REQUIREMENTS,
    classifiers=CLASSIFIERS,
    test_suite='tests.settings.test',
)
