function ColorBar(value, area, type) 
{
	density = value / area;
	if(type < 2)
	{
		if(value == 0)			return "white"
		else if(value <= 1)		return blue1
		else if(value <= 4)		return blue2
		else if(density <= 16)		return green1
		else if(density <= 32)		return green2
		else if(density <= 64)		return yellow1
		else if(density <= 128)		return yellow2
		else if(density <= 256)		return orange1
		else if(density <= 512)		return orange2
		else if(density <= 1024)	return red1
		else if(density <= 2048)	return red2
		else				return purple1
	}
	else if(type == 2)
	{
		if(value <= 4 && value >= -4)	return yellow1
    		else if(density <= -64)		return blue2
		else if(density <= -32)		return blue1
		else if(density <= -16)		return green2
		else if(density <= -8)		return green1
		else if(density < 8)		return yellow2
		else if(density < 16)		return orange1
		else if(density < 32)		return orange2
		else if(density < 64)		return red1
		else if(density < 128)		return red2
		else				return purple1
	}
}

function ColorBar2(value, pop, type) 
{
	density = value / pop * 10000;
	if(type < 2)
	{
		if(value == 0)			return "white"
		else if(value <= 1)		return blue1
		else if(value <= 4)		return blue2
		else if(density <= 10)		return green1
		else if(density <= 30)		return green2
		else if(density <= 50)		return yellow1
		else if(density <= 100)		return yellow2
		else if(density <= 200)		return orange1
		else if(density <= 400)		return orange2
		else if(density <= 800)		return red1
		else if(density <= 1600)	return red2
		else				return purple1
	}
	else if(type == 2)
	{
		if(value <= 4 && value >= -4)	return yellow1
    		else if(density <= -80)		return blue2
		else if(density <= -40)		return blue1
		else if(density <= -20)		return green2
		else if(density <= -10)		return green1
		else if(density < 10)		return yellow2
		else if(density < 20)		return orange1
		else if(density < 40)		return orange2
		else if(density < 80)		return red1
		else if(density < 160)		return red2
		else				return purple1
	}
}

function ColorBar3(value, start) 
{
	var day = (value - start)/86400000;
	if(value == 0 )			return "white"
	else if(day >= 92)		return pink1
	else if(day >= 85)		return pink2
	else if(day >= 78)		return gray1
	else if(day >= 71)		return gray2
	else if(day >= 64)		return blue1
	else if(day >= 57)		return blue2
	else if(day >= 50)		return green1
	else if(day >= 43)		return green2
	else if(day >= 36)		return yellow1
	else if(day >= 29)		return yellow2
	else if(day >= 22)		return orange1
	else if(day >= 15)		return orange2
	else if(day >= 8)		return red1
	else if(day >= 1)		return red2
	else				return purple1
}
