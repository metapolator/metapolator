# Vagrant files for Metapolator

The `Vagrantfile` contains everything needed to build the Vagrant box for
Metapolator, aside from the base box, which comes from Vagrant Cloud.

## Updating the box

When the `Vagrantfile` is modified, update the box:

```
vagrant destroy
vagrant up
vagrant package --vagrantfile Vagrantfile
```

Test the box: first, add it to the system:

```
vagrant box add --force --name metapolator package.box
```

Then, in another directory:

```
vagrant init metapolator
vagrant up
```

Finally, upload the box to Vagrant Cloud:

```
scp package.box adsensus.net:public_html/rrt/metapolator-vagrant-box/package-X.Y.Z.box # Reuben Thomas @rrthomas has to do this
```

Finally, [release](https://vagrantcloud.com/metapolator/boxes/bleeding-edge/) on Vagrant Cloud.
