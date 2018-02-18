# webpack-benchmark

The library compares some Webpack versions/branches performance.

## Execute benchmark

```sh
$ yarn benchmark v4.0.0-beta.1 v4.0.0-beta.2
$ yarn benchmark v4.0.0-beta.1 v4.0.0-beta.2 next -t parsing/context
```

## Show tasks

### All tasks

```sh
$ yarn benchmark -l
```

### Filtered tasks

```sh
$ yarn benchmark -l -t factory
```

* `webpack:*`: execute entire webpack build process using a test config.
* `factory:*`: execute specified a factory class. The factory is created by a test config.

## Compare your remove branch

```sh
# install your remove branch
$ cd webpacks
$ git clone --branch feature/neo-async git@github.com:suguru03/webpack.git neo-async
$ cd neo-async
$ yarn install

$ cd ../../
$ yarn benchmark neo-async v4.0.0-beta.2 -t factory
```
