from setuptools import setup, find_packages

setup(
    name="iacp-framework",
    version="0.2.0",
    packages=find_packages(),
    description="Institutional Agent Communication Protocol (IACP) Framework",
    long_description=open("../../README.md", encoding="utf-8").read() if __import__("os").path.exists("../../README.md") else "",
    author="IACP Framework Contributors",
    license="Apache 2.0",
    python_requires=">=3.9",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "Topic :: Communications",
    ],
)
