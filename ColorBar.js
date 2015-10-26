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
	else if(day > 140)		return gray1
	else if(day > 133)		return blue1
	else if(day > 126)		return blue2
	else if(day > 119)		return blue3
	else if(day > 112)		return blue4
	else if(day > 105)		return green1
	else if(day > 98)		return green2
	else if(day > 91)		return green3
	else if(day > 84)		return green4
	else if(day > 77)		return yellow1
	else if(day > 70)		return yellow2
	else if(day > 63)		return yellow3
	else if(day > 56)		return yellow4
	else if(day > 49)		return orange1
	else if(day > 42)		return orange2
	else if(day > 35)		return orange3
	else if(day > 28)		return orange4
	else if(day > 21)		return red1
	else if(day > 14)		return red2
	else if(day > 7)		return red3
	else if(day > 0)		return red4
	else				return purple1
}
