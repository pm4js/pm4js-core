F = open("init.js", "r")
content = F.readlines()
F.close()
F = open("dist/pm4js.js", "w")
for line in content:
	if "require" in line:
		package = line.split("require('")[1].split("'")[0]
		package_content = open(package, "r").read()
		F.write(package_content)
		F.write("\n\n")
F.close()