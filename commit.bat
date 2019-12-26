git add .
set /P name="Commit message: "
git commit -m "%name%"
git push origin master