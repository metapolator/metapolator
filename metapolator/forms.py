import re

from web.form import Form, Textbox, Dropdown, Button, Validator, Password, \
    notnull

import models


PointParamExtendedForm = Form(Dropdown('zpoint', [('', '')], description="zpoint"),
                              Textbox('x', size=12),
                              Textbox('y', size=12),
                              Textbox('doubledash', size=12),
                              Textbox('tripledash', size=12),
                              Textbox('leftp', size=12),
                              Textbox('rightp', size=12),
                              Textbox('downp', size=12),
                              Textbox('upp', size=12),
                              Textbox('dir', size=12),
                              Textbox('leftp2', size=12),
                              Textbox('rightp2', size=12),
                              Textbox('downp2', size=12),
                              Textbox('upp2', size=12),
                              Textbox('dir2', size=12),
                              Textbox('tensionand', size=12),
                              Textbox('penshifted', size=12),
                              Textbox('pointshifted', size=12),
                              Textbox('angle', size=12),
                              Textbox('penwidth', size=12),
                              Textbox('overx', size=12),
                              Textbox('overbase', size=12),
                              Textbox('overcap', size=12),
                              Textbox('overasc', size=12),
                              Textbox('overdesc', size=12),

                              Textbox('theta', size=12),
                              Textbox('serif_h_bot', size=12),
                              Textbox('serif_h_top', size=12),
                              Textbox('serif_v_left', size=12),
                              Textbox('serif_v_right', size=12))


GlobalParamForm = Form(Dropdown('idglobal', [], description='Choose parameter set'),
                       Textbox('metapolation', notnull, size=5,
                               description="metapolation", value="0"),
                       Textbox('unitwidth', notnull, size=5,
                               description="unitwidth", value="1"),
                       Textbox('fontsize', notnull, size=5,
                               description="fontsize", value="10"),
                       Textbox('mean', notnull, size=5,
                               description="mean", value="5"),
                       Textbox('cap', notnull, size=5,
                               description="cap", value="6"),
                       Textbox('asc', notnull, size=5,
                               description="asc", value="6.5"),
                       Textbox('des', notnull, size=5,
                               description="desc", value="-2"),
                       Textbox('box', notnull, size=5,
                               description="box", value="10"),
                       Button('save', value='Save Parameter Set'))


LocalParamForm = Form(Dropdown('idlocal', [(0, u'Create new local parameter')], description='Choose parameter set'),
                      Textbox('px', notnull, size=5,
                              description="px", value="0"),
                      Textbox('width', notnull, size=5,
                              description="width", value="1"),
                      Textbox('space', notnull, size=5,
                              description="space", value="0"),
                      Textbox('xheight', notnull, size=5,
                              description="xheight", value="5"),
                      Textbox('capital', notnull, size=5,
                              description="capital", value="6"),
                      Textbox('ascender', notnull, size=5,
                              description="ascender", value="6.5"),
                      Textbox('descender', notnull, size=5,
                              description="descender", value="-2"),
                      Textbox('skeleton', notnull, size=5,
                              description="skeleton", value="0"),
                      Textbox('over', notnull, size=5,
                              description="over", value="0"),
                      Textbox('jut', notnull, size=5,
                              description="jut", value="1"),
                      Textbox('slab', notnull, size=5,
                              description="slab", value="1"),
                      Textbox('bracket', notnull, size=5,
                              description="bracket", value="1"),
                      Textbox('serif_darkness', notnull, size=5,
                              description="serif_darkness", value="1"),
                      Textbox('slant', notnull, size=5,
                              description="slant", value="0"),
                      Button('save'))


def validate_existing_user(item):
    usernamecase = models.User.get(username=item.username)
    emailcase = models.User.get(email=item.email)
    return not bool(usernamecase) and not bool(emailcase)


def vemail(value):
    user_regex = re.compile(
        r"(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$"
        r"|^\"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*\"$)",
        re.IGNORECASE)
    domain_regex = re.compile(
        r'(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}|[A-Z0-9-]{2,})\.?$'
        # literal form, ipv4 address (SMTP 4.1.3)
        r'|^\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$',
        re.IGNORECASE)
    if not value or '@' not in value:
        return False
    user_part, domain_part = value.rsplit('@', 1)

    if not user_regex.match(user_part):
        return False

    if not domain_regex.match(domain_part):
        return False

    return True


RegisterForm = Form(Textbox("username", notnull, description="Username"),
                    Textbox("email", Validator("Invalid email", vemail),
                            description="E-Mail"),
                    Password("password", notnull, description="Password"),
                    Password("password2", notnull, description="Repeat password"),
                    Button("submit", type="submit", description="Register"),
                    validators=[Validator("Passwords did't match",
                                          lambda i: i.password == i.password2),
                                Validator("User with this email or username already registered",
                                          validate_existing_user)])
