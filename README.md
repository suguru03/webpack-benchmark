# webpack-benchmark

The library compares two Webpack versions performance.

## Execute

```sh
$ yarn benchmark v4.0.0-beta.1 v4.0.0-beta.2
$ yarn benchmark v4.0.0-beta.1 v4.0.0-beta.2 -t parsing/context
```

## Compare your remove branch

```sh
# install your remove branch
$ cd webpacks
$ git clone --branch feature/neo-async git@github.com:suguru03/webpack.git neo-async
$ cd neo-async
$ yarn install

$ cd ../../
$ yarn benchmark neo-async v4.0.0-beta.2
```
