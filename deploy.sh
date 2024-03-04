cd todo && npm run build
cd .. && tar cfz todo.tar.gz todo
scp todo.tar.gz root@104.248.246.56:///home/user
ssh root@104.248.246.56 "cd /home/user && rm -rf todo && tar xfz todo.tar.gz && reboot"