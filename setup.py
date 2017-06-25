from setuptools import setup, find_packages

setup(
    name='summertunes',
    version='0.1',
    packages=find_packages(),
    description='A web-based music player for beets and mpv',
    long_description='`Documentation <http://steveasleep.com/summertunes>`_',
    keywords='beets music mpv mp3',
    url="http://steveasleep.com/summertunes",
    author='Steve Johnson',
    license='MIT',
    install_requires=[
        'Click>=6',
        'beets>=1.4.4',
        'Flask>=0.11',
        'eventlet>=0.20',
    ],
    entry_points='''
        [console_scripts]
        summertunes=summertunes.cli:cli
    ''',
)
